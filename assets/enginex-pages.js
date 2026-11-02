/* GitHub Pages browser edition. Local profile metadata is not authentication. */
(()=>{'use strict';
if(location.hostname!=='iemfaraz.github.io')return;
let localProfile={};try{localProfile=JSON.parse(localStorage.getItem('enginex_local_profile')||'{}');}catch{}
const profile={username:'browser-workspace',displayName:localProfile.displayName||'Browser workspace',role:'Engineer',title:'Browser edition'};
try{localStorage.setItem('copperline_session_user',JSON.stringify(profile));}catch{}
if(!location.pathname.endsWith('/workspace.html'))return;
function mark(){
 const shell=document.querySelector('#root>.engx-pro-workspace'),header=shell?.querySelector(':scope>header');
 if(header&&!document.getElementById('ex-browser-banner')){
  const note=document.createElement('div');note.id='ex-browser-banner';note.textContent='Browser edition · Projects are saved on this device · Export backups regularly';note.style.cssText='padding:9px 24px 9px 278px;background:#fff6e9;border-top:1px solid #ecdcca;color:#765128;font:11px/1.5 Segoe UI,Arial,sans-serif';const account=document.createElement('a');account.href='../dashboard.html?v=local-only';account.textContent='Local settings →';account.style.cssText='margin-left:18px;color:#765128;font-weight:700';note.append(account);const receive=document.createElement('a');receive.href='../receive.html';receive.textContent='Receive / Import Data';receive.style.cssText='margin-left:18px;color:#765128;font-weight:700';note.append(receive);header.append(note);
 }
 if(header)for(const b of header.querySelectorAll('button')){
  const label=b.textContent+' '+b.title+' '+b.getAttribute('aria-label');
  if(/Sign Out/i.test(label)){b.hidden=true;b.style.setProperty('display','none','important');}
  else if(/Home Portal|Home Cover/i.test(label)){b.dataset.exBrowserHome='1';b.title='Return to overview';}
 }
}
let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;mark();});}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',mark);
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.exBrowserHome){e.preventDefault();e.stopImmediatePropagation();location.reload();}},true);
const style=document.createElement('style');style.textContent='@media(max-width:780px){#ex-browser-banner{padding:9px 14px!important}}@media print{#ex-browser-banner{display:none!important}}';document.head.append(style);
})();
