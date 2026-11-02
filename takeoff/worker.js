// GPL-3.0-or-later: DWG parser adapter; upstream source and license are in vendor/libredwg/.
import './vendor/dxf-parser.js';
import {analyzeDrawingAsync,fromDXF} from './core.js?v=large-auto1';
import {cadFailure,releaseDrawing} from './errors.js';
self.onmessage=async({data})=>{
 let stage='loading drawing engine';
 try{
  let database,decoderWarning=null;
  if(data.format==='dwg'){
   postMessage({status:'Loading local DWG engine…'});
   const response=await fetch(new URL('./vendor/libredwg/wasm/libredwg-web.wasm.gz',import.meta.url));
   if(!response.ok)throw Error('DWG engine download failed.');
   const wasmBinary=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
   const {LibreDwg,createModule}=await import('./vendor/libredwg/dist/libredwg-web.js');
   const module=await createModule({wasmBinary:new Uint8Array(wasmBinary),print:()=>{},printErr:()=>{}}),reader=new LibreDwg(module);
   let pointer=null,primaryError=null;
   try{
    stage='decoding DWG data';postMessage({status:'Decoding DWG model-space entities…'});
    // Let MEMFS own the transferred file buffer instead of allocating another full copy.
    module.FS.writeFile('takeoff.dwg',new Uint8Array(data.buffer),{canOwn:true});
    const decoded=module.dwg_read_file('takeoff.dwg');pointer=decoded.data;
    if(decoded.error&8192)throw Error('DWG decoder ran out of memory (OUTOFMEM).');
    if(decoded.error>=128)throw Error('DWG decoder could not reliably read this drawing (code '+decoded.error+'). Save as ASCII DXF and try again.');
    if(!pointer)throw Error('DWG decoder returned no drawing data.');
    if(decoded.error)decoderWarning='DWG decoder reported warning code '+decoded.error+'. Review this potentially partial decode against the original drawing.';
    // The virtual input file is no longer needed once native decoding completes.
    module.FS.unlink('takeoff.dwg');
    stage='converting DWG objects';postMessage({status:'Converting decoded DWG objects…'});
    database=reader.convert(pointer);
    const normalize=entities=>{for(const entity of entities||[])if(entity.type==='LWPOLYLINE')entity.flag=(entity.flag&512)?1:0;};
    normalize(database.entities);for(const block of database.tables?.BLOCK_RECORD?.entries||[])normalize(block.entities);
   }catch(error){primaryError=error;throw error;}
   finally{
    try{if(module.FS.analyzePath('takeoff.dwg').exists)module.FS.unlink('takeoff.dwg');}catch{}
    releaseDrawing(reader,pointer,primaryError);
   }
  }else{
   stage='parsing ASCII DXF';const text=new TextDecoder().decode(data.buffer);
   if(text.startsWith('AutoCAD Binary DXF'))throw Error('Binary DXF is not supported. Save as ASCII DXF or upload the DWG.');
   database=fromDXF(new self.DxfParser().parseSync(text));
  }
  stage='measuring decoded geometry';postMessage({status:'Measuring geometry and block insertions…'});
  const result=await analyzeDrawingAsync(database,{onProgress:progress=>postMessage({status:'Measuring drawing · '+progress.processed.toLocaleString()+' object visits · '+progress.modelReviewed.toLocaleString()+' / '+progress.modelTotal.toLocaleString()+' model records',progress})});if(decoderWarning)result.warnings.unshift({message:decoderWarning,count:1});
  const transfers=result.groups.filter(g=>g.instances instanceof Float64Array).map(g=>g.instances.buffer);postMessage({result},[...new Set(transfers)]);
 }catch(error){postMessage(cadFailure(error,{format:data.format,stage}));}
};
