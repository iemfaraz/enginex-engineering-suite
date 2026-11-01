/* Shared report preview. Print clones never modify live project inputs. */
(()=>{'use strict';
let dialog,frame,source,title,quotationWidth=0,hasLetterhead=false,orientation='portrait',fit=false,fitChosen=false,oldFocus;
const isWorkspace=location.pathname.endsWith('/workspace.html');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stored(key){try{return JSON.parse(localStorage.getItem(key)||'{}');}catch{return {};}}
function mode(){const main=document.querySelector('#root>.engx-pro-workspace>main');if(!main)return 'Document';if(main.classList.contains('ex-overview-mode'))return 'Overview';if(main.querySelector('input[placeholder="Load description..."]'))return 'Load Schedule';if(main.textContent.includes('Commercial Terms Editor'))return 'Commercial Quotation';if(main.textContent.includes('Bill of Quantities (BOQ)'))return 'Bill of Quantities';if(main.textContent.includes('Material Technical Submittal')&&main.querySelector('[class*="print:shadow-none"]'))return 'Quality Document';return 'Engineering Report';}
function originalQuotation(element){
 const copy=element.cloneNode(true), originals=[element,...element.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];
 // Freeze the original document's rendered styles, including responsive columns.
 // No shared BOQ/QC report styles are applied to this copy.
 const properties=['display','box-sizing','width','min-width','max-width','min-height','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-transform','text-decoration','color','background-color','background-image','border-top','border-right','border-bottom','border-left','border-collapse','border-spacing','border-radius','vertical-align','white-space','overflow-wrap','word-break','direction','unicode-bidi','flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','justify-content','align-items','align-self','gap','row-gap','column-gap','grid-template-columns','grid-template-rows','grid-auto-flow','object-fit','object-position','list-style-type'];
 for(let i=0;i<originals.length;i++){
  const from=originals[i],to=clones[i],style=getComputedStyle(from);
  for(const property of properties)to.style.setProperty(property,style.getPropertyValue(property));
  to.style.setProperty('box-shadow','none');
  for(const a of [...to.attributes])if(a.name.startsWith('on')||a.name==='id'||a.name==='contenteditable')to.removeAttribute(a.name);
 }
 const originalControls=[...element.querySelectorAll('input,textarea,select')];
 [...copy.querySelectorAll('input,textarea,select')].forEach((input,i)=>{const o=originalControls[i],value=document.createElement('span');value.style.cssText=input.style.cssText;value.textContent=o.tagName==='SELECT'?o.selectedOptions[0]?.textContent||'':o.value;input.replaceWith(value);});
 copy.querySelectorAll('button,script,style,link,iframe,input[type=file]').forEach(x=>x.remove());
 quotationWidth=element.getBoundingClientRect().width;
 copy.style.width=quotationWidth+'px';copy.style.maxWidth='none';copy.style.height='auto';copy.style.boxShadow='none';copy.style.border='0';copy.style.borderRadius='0';
 return copy;
}
function renderOriginalQuotation(){
 const availableWidth=(orientation==='landscape'?277:190)*96/25.4;
 const pageHeight=(orientation==='landscape'?190:277)*96/25.4-6;
 frame.onload=()=>{
  const paper=frame.contentDocument.getElementById('print-paper');if(!paper)return;
  const widthScale=Math.min(1,availableWidth/quotationWidth),naturalHeight=paper.getBoundingClientRect().height;
  let scale=fit?Math.min(widthScale,pageHeight/naturalHeight):widthScale;
  if(fit&&!fitChosen&&scale<widthScale*.8){fit=false;scale=widthScale;dialog.querySelector('#ex-print-fit').checked=false;}
  paper.style.zoom=String(scale);
  dialog.querySelector('#ex-print-hint').textContent='Original quotation layout · '+(fit?'Fit to one page':'Automatic pages')+' · '+Math.round(scale*100)+'% · Letterhead, columns, totals, terms and signatures preserved.';
 };
 frame.srcdoc='<!doctype html><html><head><meta charset="utf-8"><base href="'+esc(location.href)+'"><title>Quotation — ENGINEX</title><style>html,body{margin:0;background:white;}#print-paper{width:'+quotationWidth+'px;margin:0 auto;overflow:visible;}table{break-inside:auto;}thead{display:table-header-group;}tr{break-inside:avoid;}p{orphans:3;widows:3;}@page{size:A4 '+orientation+';margin:10mm;}@media print{html,body{overflow:visible!important;}#print-paper{margin:0!important;}*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body><div id="print-paper">'+source.outerHTML+'</div></body></html>';
}
function prepareSource(){
 title=isWorkspace?mode():document.querySelector('.sheet h1')?.textContent||'Site Document';
 if(title==='Overview'){alert('Open a document, BOQ, quotation or load schedule before printing.');return false;}
 orientation=title==='Load Schedule'?'landscape':'portrait';fit=true;fitChosen=false;
 const main=isWorkspace?document.querySelector('#root>.engx-pro-workspace>main'):document.querySelector('.sheet');
 if(!main){alert('Select a document before printing.');return false;}
 const official=main.querySelector('[class*="print:shadow-none"]');hasLetterhead=!!official||!isWorkspace;source=(official||main).cloneNode(true);
 if(title==='Commercial Quotation'){if(!official){alert('Open the original quotation document before printing.');return false;}source=originalQuotation(official);return true;}
 // Keep current editor values, selected options and all multiline notes in the printed clone.
 const originals=[...(official||main).querySelectorAll('input,textarea,select')];
 const copies=[...source.querySelectorAll('input,textarea,select')];
 for(let i=0;i<copies.length;i++){const c=copies[i],o=originals[i]||c;const value=document.createElement('span');value.className='ex-report-value';value.textContent=o.type==='checkbox'?(o.checked?'☑':'☐'):o.tagName==='SELECT'?o.selectedOptions[0]?.textContent||'':o.value||'—';if(['file','hidden'].includes(o.type))c.remove();else c.replaceWith(value);}
 source.querySelectorAll('.ex-overview,.no-print,.sheet-actions,.add-row-btn,.rowdel,[data-qcd-ui-only]').forEach(x=>x.remove());
 if(title==='Load Schedule'){
  const h=[...source.querySelectorAll('h2')].find(h=>h.textContent.includes('Distribution Board Parameters'));if(h){const block=h.closest('section');if(block)block.remove();}
 }
 source.querySelectorAll('button,script,iframe,style,link,svg').forEach(x=>x.remove());
 // UI-only columns must not consume document width.
 source.querySelectorAll('table').forEach(table=>{
  const head=table.tHead?.rows[0];if(!head)return;const remove=[...head.cells].map((c,i)=>/^(actions?|delete|source)$/i.test(c.textContent.trim())?i:-1).filter(i=>i>=0);
  for(const row of table.rows){let col=0;for(const cell of [...row.cells]){const span=cell.colSpan||1;const kept=Array.from({length:span},(_,i)=>col+i).filter(i=>!remove.includes(i)).length;col+=span;if(!kept)cell.remove();else if(kept!==span)cell.colSpan=kept;}}
 });
 // Normalize BOQ section rows whose first colspan cell was styled as a flexbox in the editor.
 source.querySelectorAll('td[colspan]').forEach(td=>{td.style.setProperty('display','table-cell','important');});
 if(title==='Load Schedule'){
  const table=source.querySelector('table'),compact=document.createElement('section');
  const textOf=node=>{const w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),parts=[];while(w.nextNode()){const text=w.currentNode.textContent.trim();if(text)parts.push(text);}return parts.join(' · ');};
  const parameters=[...source.querySelectorAll('h2')].find(x=>x.textContent.includes('Distribution Board Parameters'));if(parameters){const p=document.createElement('p');p.className='ex-schedule-note';p.textContent=textOf(parameters.closest('[class*="bg-white"]')||parameters.parentElement);compact.append(p);}
  const metrics=document.createElement('div');metrics.className='ex-schedule-metrics';
  for(const label of ['Connected Load','Demand Load','Demand Current','Main Incomer MCCB','Phase Balance (3-Phase SEC Rule)']){
   const leaf=[...source.querySelectorAll('*')].find(x=>!x.children.length&&x.textContent.trim()===label);
   if(leaf){const box=document.createElement('div');box.textContent=textOf(leaf.parentElement);metrics.append(box);}
  }
  compact.append(metrics);
  const feeder=[...source.querySelectorAll('*')].find(x=>!x.children.length&&x.textContent.includes('Feeder Network & Cumulative Voltage Drop Chain'));
  if(feeder){const box=document.createElement('p');box.className='ex-schedule-note';let block=feeder.parentElement;while(block.parentElement&&block.parentElement!==source&&!block.textContent.includes('Allowable Cumulative'))block=block.parentElement;box.textContent=textOf(block);compact.append(box);}
  if(table){for(const cell of table.querySelectorAll('th,td')){const walker=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT),parts=[];while(walker.nextNode())parts.push(walker.currentNode.textContent.trim());cell.textContent=parts.filter(Boolean).join(' ');}compact.append(table);}source=compact;
 }
 source.querySelectorAll('*').forEach(x=>{if(!x.children.length&&/Grand Total|Signature & Corporate Stamp|Authorized Signature/.test(x.textContent))x.parentElement?.classList.add('ex-keep');});
 source.querySelectorAll('table').forEach(t=>{t.dataset.columns=String(t.tHead?.rows[0]?.cells.length||t.rows[0]?.cells.length||0);});
 source.querySelectorAll('*').forEach(x=>{x.removeAttribute('contenteditable');x.removeAttribute('id');for(const a of [...x.attributes])if(a.name.startsWith('on'))x.removeAttribute(a.name);x.removeAttribute('title');x.removeAttribute('tabindex');x.style.removeProperty('transform');x.style.removeProperty('zoom');});
 return true;
}
const reportCSS=`
*{box-sizing:border-box}html,body{margin:0;background:#fff;color:#172d3b;font-family:Arial,"Segoe UI",sans-serif;font-size:10pt;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.ex-paper{margin:0 auto;background:#fff;padding:0}.ex-report-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:2px solid #173747;padding:0 0 13px;margin-bottom:18px}.ex-report-heading h1{font-size:19pt;line-height:1.2;letter-spacing:-.03em;margin:5px 0;color:#173747}.ex-report-brand{font-size:9pt;font-weight:700;letter-spacing:.13em;color:#9b6d36}.ex-report-date{font-size:8pt;text-align:right;white-space:nowrap;color:#657681}.ex-meta{font-size:8.5pt;color:#526873;margin-top:6px;overflow-wrap:anywhere}.ex-report-body{width:100%;height:auto;min-height:0;overflow:visible}.ex-report-body>main,.ex-report-body>div,.ex-report-body>section{max-width:100%!important;width:100%!important;box-shadow:none!important;border-radius:0!important;height:auto!important;min-height:0!important;max-height:none!important;background:#fff!important;color:#172d3b!important;margin-left:0!important;padding:0!important}.ex-report-body [class*="overflow"]{overflow:visible!important;max-height:none!important}.ex-report-body *{box-shadow:none!important;text-shadow:none!important;min-width:0!important}.ex-report-body table{display:table!important;width:100%!important;min-width:0!important;max-width:100%!important;border-collapse:collapse!important;table-layout:fixed!important;font-size:8pt!important;margin:12px 0}.ex-report-body thead{display:table-header-group!important}.ex-report-body tfoot{display:table-row-group!important}.ex-report-body tr{break-inside:avoid;page-break-inside:avoid}.ex-report-body th,.ex-report-body td{display:table-cell!important;border:1px solid #bccbd3!important;padding:7px 6px!important;white-space:normal!important;overflow-wrap:anywhere!important;vertical-align:top!important;font-size:8pt!important;line-height:1.35!important;color:#172d3b!important;height:auto!important;width:auto!important}.ex-report-body th{background:#edf2f5!important;color:#25485b!important;font-weight:700!important}.ex-report-body td[colspan]{background:#f5f7f8;font-weight:600}.ex-report-body tbody tr:nth-child(even){background:#fafbfc}body.numeric-report .ex-report-body table tr>:first-child{width:7%!important}body.numeric-report .ex-report-body table tr>:nth-child(2){width:36%!important}.ex-report-body img{max-width:100%!important;max-height:24mm;object-fit:contain}.ex-report-body h1,.ex-report-body h2,.ex-report-body h3,.ex-report-body h4{break-after:avoid;page-break-after:avoid;color:#183747!important;line-height:1.25}.ex-report-body .ex-keep{break-inside:avoid;page-break-inside:avoid}.ex-report-body p{orphans:3;widows:3}.ex-report-body .grid{break-inside:auto}.ex-report-body .ex-report-value{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;color:#172d3b;display:inline;min-width:0}.ex-report-body [class*="text-right"]{font-variant-numeric:tabular-nums}.ex-report-body [class*="rounded"]{border-radius:0!important}.ex-schedule-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;font-size:8pt;line-height:1.5;margin:10px 0}.ex-schedule-metrics>div{padding:8px;border:1px solid #ccd8de;background:#f6f8f9}.ex-schedule-note{font-size:7pt;line-height:1.5;margin:10px 0;padding:8px;border-left:2px solid #c69b61}.ex-report-footer{border-top:1px solid #c8d3da;padding-top:8px;margin-top:18px;font-size:7pt;letter-spacing:.04em;color:#697e88;break-inside:avoid}.ex-report-body .print\\:hidden{display:none!important}
body.landscape .ex-report-body table{font-size:7pt!important}body.landscape .ex-report-body td,body.landscape .ex-report-body th{font-size:7pt!important;padding:5px 3px!important;line-height:1.25!important}body.landscape.numeric-report .ex-report-body table tr>:first-child{width:4%!important}body.landscape.numeric-report .ex-report-body table tr>:nth-child(2){width:5%!important}body.landscape.numeric-report .ex-report-body table tr>:nth-child(3){width:23%!important}
.ex-report-body .truncate,.ex-report-body [class*="line-clamp"]{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;max-height:none!important;display:block!important}.ex-report-body [class*="text-slate-400"]{color:#526873!important}
body.document .ex-report-body table[data-columns="2"] tr>:first-child{width:25%!important}body.document .ex-report-body table[data-columns="2"] tr>:nth-child(2){width:auto!important}body.document .ex-report-body [class*="mb-"]{margin-bottom:9px!important}body.document .ex-report-body [class*="p-3"],body.document .ex-report-body [class*="p-4"],body.document .ex-report-body [class*="p-5"]{padding:7px!important}body.document .ex-report-body [class*="bg-slate-9"]{background:#edf2f5!important;color:#183747!important}body.document .ex-report-body [class*="bg-slate-9"] *{color:#183747!important}
@media print{html,body{width:auto!important;height:auto!important;overflow:visible!important}.ex-paper{width:100%!important;box-shadow:none!important;margin:0!important}header,button,nav{display:none!important}}
`;
function render(){
 if(title==='Commercial Quotation'){renderOriginalQuotation();return;}
 const project=stored('copperline_project_v3'),company=stored('copperline_company_v3');
 const baseStyles=[...document.querySelectorAll('style')].filter(s=>!s.id).slice(0,1).map(s=>s.textContent).join('\n');
 const width=orientation==='landscape'?277:190;
 const markup=`<!doctype html><html><head><meta charset="utf-8"><base href="${esc(location.href)}"><title>${esc(title)} — ENGINEX</title><style>${baseStyles}</style><style>${reportCSS}\n@page{size:A4 ${orientation};margin:10mm} .ex-paper{width:${width}mm} </style></head><body class="${orientation} ${title==='Quality Document'||!isWorkspace?'document':'numeric-report'}"><div class="ex-paper" id="print-paper">${hasLetterhead?'':`<div class="ex-report-heading"><div><div class="ex-report-brand">${esc(company.name||company.nameEn||'ENGINEX ENGINEERING SUITE')}</div><h1>${esc(title)}</h1><div class="ex-meta">${esc(project.name||'')}${project.location?' · '+esc(project.location):''}</div></div><div class="ex-report-date">${esc(new Date().toLocaleDateString('en-GB'))}<br>A4 · ${orientation==='landscape'?'Landscape':'Portrait'}</div></div>`}<div class="ex-report-body">${source.outerHTML}</div><div class="ex-report-footer">ENGINEX · ${esc(title)} · ${esc(company.refNumber||'Engineering & Project Delivery')}</div></div></body></html>`;
 frame.onload=()=>{
  const doc=frame.contentDocument,paper=doc.getElementById('print-paper');if(!paper)return;
  const pageHeight=(orientation==='landscape'?190:277)*96/25.4-6;
  let scale=fit?Math.min(1,pageHeight/paper.scrollHeight):1;
  if(fit&&!fitChosen&&scale<.8){fit=false;scale=1;dialog.querySelector('#ex-print-fit').checked=false;}
  if(fit){paper.style.zoom=String(scale);}
  dialog.querySelector('#ex-print-hint').textContent=fit?`Fit to one page · ${Math.round(scale*100)}%${scale<.65?' · Small text: consider multi-page mode.':''}`:'Automatic pages · Tables repeat their column headings. No content is cropped.';
 };
 frame.srcdoc=markup;
}
function close(){dialog?.remove();dialog=null;oldFocus?.focus();}
function open(){
 if(!prepareSource())return;
 oldFocus=document.activeElement;dialog=document.createElement('div');dialog.id='ex-print-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Document print preview');
 dialog.style.cssText='position:fixed;inset:0;z-index:2147483600;background:#e7edf1;display:flex;flex-direction:column;color:#183747;font:13px Segoe UI,Arial,sans-serif';
 dialog.innerHTML='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:14px 20px;background:white;border-bottom:1px solid #ccd8df"><strong style="margin-right:auto">Document print preview</strong><label>Paper <select id="ex-print-paper" style="padding:8px;border:1px solid #cad5dc;border-radius:6px"><option value="portrait">A4 portrait</option><option value="landscape">A4 landscape</option></select></label><label><input id="ex-print-fit" type="checkbox"> Fit one page</label><button id="ex-print-go" style="background:#173747;color:white;border:0;padding:10px 16px;border-radius:6px">Print / Save PDF</button><button id="ex-print-close" style="padding:10px;border:1px solid #ccd8df;border-radius:6px;background:white">Close preview</button></div><p id="ex-print-hint" role="status" style="margin:10px 20px;font-size:12px"></p><iframe title="Printable report" style="border:0;flex:1;width:100%;min-height:0;background:white"></iframe>';
 document.body.append(dialog);frame=dialog.querySelector('iframe');
 dialog.querySelector('#ex-print-paper').value=orientation;dialog.querySelector('#ex-print-fit').checked=fit;
 dialog.querySelector('#ex-print-paper').onchange=e=>{orientation=e.target.value;render();};
 dialog.querySelector('#ex-print-fit').onchange=e=>{fit=e.target.checked;fitChosen=true;render();};
 dialog.querySelector('#ex-print-close').onclick=close;
 dialog.querySelector('#ex-print-go').onclick=()=>{frame.contentWindow.focus();frame.contentWindow.print();};
 dialog.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const controls=[...dialog.querySelectorAll('button,select,input,iframe')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 render();dialog.querySelector('#ex-print-go').focus();
}
document.addEventListener('click',e=>{
 if(dialog)return;const b=e.target.closest('button');if(!b)return;const label=(b.textContent+' '+b.title+' '+b.getAttribute('aria-label')).trim();
 if(/print|preview.*qc/i.test(label)&&!/^hide/i.test(label)&&!b.closest('#qcd-preview-overlay')){e.preventDefault();e.stopImmediatePropagation();open();}
},true);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();if(dialog){frame.contentWindow.focus();frame.contentWindow.print();}else open();}});
window.ENGINEX_PRINT=open;
})();
