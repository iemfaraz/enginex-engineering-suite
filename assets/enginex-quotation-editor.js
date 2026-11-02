import{reviewItems}from '../professional/review.js?v=pro1';
// Quotation-only items: edits do not alter the BOQ or load schedule.
export const number=value=>Math.max(0,Number.isFinite(Number(value))?Number(value):0);
export function totals(items,vatRate){const subtotal=items.reduce((sum,item)=>sum+number(item.quantity)*number(item.unitRateSar),0),vat=subtotal*Math.min(100,number(vatRate))/100;return{subtotal,vat,total:subtotal+vat};}
export const copyItems=items=>items.map(item=>({...item}));
export function blankItem(){return{id:'quote-'+crypto.randomUUID(),description:'',unit:'pcs',quantity:1,unitRateSar:0,section:'Quotation',source:'Manual'};}
export function QuotationItems({React:R,items,quotation,onChange,boqItems}){
 const h=R.createElement,[undo,setUndo]=R.useState([]);
 function commit(next){setUndo(history=>[...history.slice(-19),copyItems(items)]);onChange(old=>({...old,items:next}));}
 function update(index,key,value){commit(items.map((item,i)=>i===index?{...item,[key]:value}:item));}
 const input=(label,value,change,type='text',extra={})=>h('label',{style:{display:'block',fontSize:11,fontWeight:600}},label,h('input',{type,value:value??'',onChange:e=>change(e.target.value),...extra,style:{display:'block',width:'100%',padding:'7px 8px',border:'1px solid #cbd5e1',borderRadius:6,fontSize:12,background:'#fff',color:'#172b3a',...extra.style}}));
 const button=(text,fn,extra={})=>h('button',{type:'button',onClick:fn,...extra,style:{padding:'6px 9px',border:'1px solid #cbd5e1',borderRadius:6,background:'#fff',color:'#173448',fontSize:11,fontWeight:600,cursor:'pointer',...extra.style}},text);
 const money=value=>number(value).toLocaleString('en-SA',{minimumFractionDigits:2,maximumFractionDigits:2});
 return h('section',{className:'no-print',id:'engx-quotation-items',style:{borderBottom:'1px solid #e2e8f0',paddingBottom:18,marginBottom:12}},
 h('h3',{style:{fontWeight:800,fontSize:14,marginBottom:7}},'Quotation items editor'),
 h('p',{style:{fontSize:11,color:'#64748b',marginBottom:10}},Array.isArray(quotation.items)?'Manual quotation — independent of BOQ. Changes save automatically.':'Currently linked to BOQ. Editing creates an independent quotation copy.'),
 h('div',{style:{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}},
 button('+ Add item',()=>commit([...copyItems(items),blankItem()]),{disabled:items.length>=5000}),
 button('Start blank',()=>{if(!items.length||window.confirm('Remove all quotation line items and start with one empty row? The BOQ will stay unchanged.'))commit([blankItem()]);}),
 button('Review current BOQ',async()=>{try{const next=await reviewItems(items,boqItems,'BOQ → quotation review',()=>JSON.parse(localStorage.getItem('copperline_quote_v3')||'{}').items||items);if(next)commit(next);}catch(e){alert(e.message);}}),
 button('Undo',()=>{const previous=undo.at(-1);if(previous){onChange(old=>({...old,items:previous}));setUndo(history=>history.slice(0,-1));}},{disabled:!undo.length})),
 h('div',{style:{maxHeight:520,overflowY:'auto',display:'grid',gap:10}},items.length?items.map((item,i)=>h('div',{key:item.id||i,style:{padding:10,border:'1px solid #e2e8f0',borderRadius:8,background:'#f8fafc'}},
 h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},h('strong',{style:{fontSize:11}},'Item '+(i+1)),h('span',{style:{fontSize:11}},'SAR '+money(number(item.quantity)*number(item.unitRateSar)))),
 h('label',{style:{display:'block',fontSize:11,fontWeight:600}},'Description '+(i+1),h('textarea',{value:item.description||'',rows:2,maxLength:5000,onChange:e=>update(i,'description',e.target.value),style:{display:'block',width:'100%',padding:7,border:'1px solid #cbd5e1',borderRadius:6,fontSize:12,background:'#fff',color:'#172b3a'}})),
 h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:8}},input('Unit '+(i+1),item.unit,value=>update(i,'unit',value)),input('Quantity '+(i+1),item.quantity,value=>update(i,'quantity',value===''?'':number(value)),'number',{min:0,step:'any'}),input('Rate SAR '+(i+1),item.unitRateSar,value=>update(i,'unitRateSar',value===''?'':number(value)),'number',{min:0,step:'0.01'})),
 h('div',{style:{display:'flex',flexWrap:'wrap',gap:5,marginTop:9}},
 button('↑',()=>{const next=copyItems(items);[next[i-1],next[i]]=[next[i],next[i-1]];commit(next);},{disabled:i===0,'aria-label':'Move item '+(i+1)+' up'}),
 button('↓',()=>{const next=copyItems(items);[next[i+1],next[i]]=[next[i],next[i+1]];commit(next);},{disabled:i===items.length-1,'aria-label':'Move item '+(i+1)+' down'}),
 button('Duplicate',()=>{const next=copyItems(items);next.splice(i+1,0,{...item,id:blankItem().id});commit(next);},{'aria-label':'Duplicate item '+(i+1),disabled:items.length>=5000}),
 button('Remove',()=>commit(items.filter((_,index)=>index!==i)),{'aria-label':'Remove item '+(i+1),style:{color:'#a12e29'}}))
 )):h('p',{style:{fontSize:12,color:'#64748b'}},'No line items. Select Add item to build your quotation.')),
 h('div',{style:{display:'grid',gap:9,marginTop:12}},input('Quotation VAT (%)',quotation.vatRate??15,value=>onChange(old=>({...old,vatRate:value===''?'':Math.min(100,number(value))})),'number',{min:0,max:100,step:'any'}),input('Prepared by / Authorized engineer',quotation.preparedBy,value=>onChange(old=>({...old,preparedBy:value})))),
 h('p',{style:{fontSize:11,color:'#64748b',marginTop:9}},items.length+' items · subtotal SAR '+money(totals(items,quotation.vatRate??15).subtotal))
 );
}
