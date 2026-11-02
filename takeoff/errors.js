export function cadFailure(error,{format='drawing',stage='processing'}={}){
 const detail=error?.message||String(error),type=format.toUpperCase();
 const outOfMemory=/out of memory|outofmem|allocation failed|cannot enlarge|could not allocate|invalid (?:array|typed array) length|array buffer allocation/i.test(detail);
 const bounds=/memory (?:access )?out of bounds|outside.*(?:memory|bounds)|unreachable|table index is out of bounds/i.test(detail);
 if(outOfMemory)return{code:'CAD_MEMORY_EXHAUSTED',stage,detail,error:type+' processing ran out of memory during '+stage+'. The 150 MB upload limit is not a guarantee that the decoded drawing fits in browser memory. Export only the required discipline or floor to a smaller file, or try a clean ASCII DXF. Your previous saved takeoff has not been replaced.'};
 if(bounds)return{code:'CAD_DECODER_TRAP',stage,detail,error:type+' reader stopped during '+stage+' with a WebAssembly memory error. This can be a decoder/unsupported-data problem or memory pressure; the message alone does not identify which. Try exporting a clean ASCII DXF or a smaller discipline drawing. Your previous saved takeoff has not been replaced.'};
 return{code:'CAD_READ_FAILED',stage,detail,error:type+' could not be processed during '+stage+': '+detail};
}
// An invalid native data structure must not be freed after a WebAssembly trap.
export function isNativeTrap(error){return /memory (?:access )?out of bounds|unreachable|table index is out of bounds/i.test(error?.message||String(error));}
export function releaseDrawing(reader,pointer,primaryError=null){if(!pointer||isNativeTrap(primaryError))return;try{reader.dwg_free(pointer);}catch(error){if(!primaryError)throw error;}}
