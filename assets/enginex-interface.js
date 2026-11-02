
/* Presentation layer only: engineering calculations and storage remain in their modules. */
(()=>{'use strict';
const workspace=location.pathname.endsWith('/workspace.html');
const requestedTool=new URLSearchParams(location.search).get('tool');let openedRequestedTool=false;
const toolLabels={schedule:'Load Schedule','auto-sizing':'Automatic Board Sizing',boq:'Bill of Quantities',quotation:'Quotation',ict:'ICT Calculations',toolkit:'Engineering Toolkit',qc:'QC Documents',transformer:'Transformer Suite',codes:'Saudi Electrical Codes'};
if(!workspace){document.body.classList.add('ex-module-page');return;}
let active='overview',queued=false;
const cards=[
['Load Schedule','Electrical design','Load schedules, phase balance, feeder sizing and voltage drop.','ϟ'],
['Automatic Board Sizing','Distribution planning','Plan MDB, SMDB and DB distribution from your connected load.','⌘'],
['Bill of Quantities','Quantities & costing','Build material take-offs and review project costs in SAR.','▤'],
['Scheduler P6','Project controls','Manage activities, critical paths, progress and earned value.','▥'],
['Site Forms','Site documentation','Prepare inspection requests, handover and quality records.','▧'],
['Engineering Toolkit','Engineering calculations','Open electrical calculators in one focused workspace.','◇'],
['Transformer Suite','Transformer engineering','Review sizing, protection, losses and QA/QC reports.','↯'],
['Quotation','Commercial desk','Prepare client quotations, VAT and printable letterheads.','▣'],
['ICT Calculations','ICT & low current','Calculate network, CCTV, fiber and infrastructure requirements.','⌁']];
function nav(){return document.querySelector('#root>.engx-pro-workspace>header>div:nth-child(2)>div');}
function target(label){return [...(nav()?.querySelectorAll('button')||[])].find(b=>b.id!=='ex-overview-button'&&b.textContent.includes(label));}
function sync(){
 queued=false;
 const overlay=document.getElementById('engx-login-overlay');
 const root=document.getElementById('root');if(root)root.inert=!!overlay;
 for(const el of document.querySelectorAll('#engx-sidebar-toggle'))el.inert=!!overlay;
 if(overlay&&!overlay.dataset.exReady){
 overlay.dataset.exReady='1';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','ENGINEX sign in');
 const visual=overlay.querySelector('.engx-visual-content');
 if(visual){visual.querySelector('.engx-eyebrow').textContent='ENGINEERING, CONNECTED';visual.querySelector('h1').innerHTML='One workspace.<br><span>Every project stage.</span>';visual.querySelector('.engx-visual-copy').textContent='From electrical design to site delivery. Bring calculations, project controls and documentation together with ENGINEX.';}
 overlay.querySelector('h2').textContent='Welcome to ENGINEX';overlay.querySelector('.engx-auth-lead').textContent='Sign in to your engineering workspace.';
 const note=overlay.querySelector('.engx-trial-note');if(note)note.textContent='Offline edition · Accounts and project data are saved in this browser. Use backups to keep a copy of your work.';
 const secure=overlay.querySelector('.engx-secure');if(secure)secure.textContent='Engineering Suite · v8.4';
 const info=overlay.querySelector('#engx-download-info span');if(info)info.textContent='↓  Offline edition information';
 const status=overlay.querySelector('.engx-login-status-left');if(status)status.innerHTML='<strong>ENGINEX</strong><span>By Engineer Faraz Nawaz</span>';
 const username=overlay.querySelector('#engx-username');if(username)username.required=true;
 const password=overlay.querySelector('#engx-password');if(password)password.required=true;
 }
 const n=nav(),main=document.querySelector('#root>.engx-pro-workspace>main');if(!n||!main)return;
 if(!document.getElementById('ex-command-centre')){const b=document.createElement('button');b.type='button';b.id='ex-command-centre';b.textContent='⌂ Project dashboard';b.onclick=()=>location.assign('../portal.html');n.prepend(b);}

 if(!document.getElementById('ex-engineering-hub')){const b=document.createElement('button');b.type='button';b.id='ex-engineering-hub';b.textContent='⌘ Electrical Engineering Tools · 13';b.onclick=()=>location.assign('../engineering.html');n.append(b);}

 if(!document.getElementById('ex-overview-button')){
 const b=document.createElement('button');b.type='button';b.id='ex-overview-button';b.innerHTML='<span aria-hidden="true">▦</span><span>Overview</span>';b.onclick=()=>{active='overview';sync();};n.prepend(b);
 const search=document.createElement('input');search.type='search';search.className='ex-nav-search';search.placeholder='Find an engineering tool…';search.setAttribute('aria-label','Find an engineering tool');search.oninput=()=>{const q=search.value.trim().toLowerCase();n.querySelectorAll('button').forEach(b=>{b.hidden=!!q&&!b.textContent.toLowerCase().includes(q);b.style.setProperty('display',b.hidden?'none':'flex','important');});};n.insertBefore(search,b);
 n.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.id!=='ex-overview-button'){active='module';main.classList.remove('ex-overview-mode');document.getElementById('ex-overview-button')?.classList.remove('ex-current');}});
 }
 if(!main.querySelector('.ex-overview')){
 const dashboard=document.createElement('section');dashboard.className='ex-overview';dashboard.setAttribute('aria-label','Engineering overview');
 dashboard.innerHTML='<div class="ex-hero"><div><div class="ex-kicker">ENGINEX / ENGINEERING WORKSPACE</div><h2>Good work starts here.</h2><p class="ex-intro" style="margin-bottom:0">Plan with clarity. Design with confidence. Deliver with control.</p></div><div class="ex-hero-badge">EX<small>ENGINEERING SUITE</small></div></div><h3>Your engineering tools</h3><div class="ex-grid"></div><div class="ex-summary"><span>Design & calculations</span><span>Project controls</span><span>Site & quality records</span><span>Saved on this browser</span></div>';
 const grid=dashboard.querySelector('.ex-grid');cards.forEach(([label,title,copy,icon])=>{const b=document.createElement('button');b.type='button';b.className='ex-module';b.innerHTML='<span class="ex-icon" aria-hidden="true">'+icon+'</span><strong>'+title+'</strong><p>'+copy+'</p><span class="ex-open">OPEN TOOL &nbsp; ↗</span>';b.onclick=()=>{const t=target(label);if(t)t.click();};grid.append(b);});const hub=document.createElement('button');hub.type='button';hub.className='ex-module';hub.innerHTML='<span class="ex-icon" aria-hidden="true">⌘</span><strong>Electrical engineering workbench</strong><p>13 tools: cable schedules, SLDs, commissioning, lighting, fault calculations and more.</p><span class="ex-open">OPEN 13 TOOLS &nbsp; ↗</span>';hub.onclick=()=>location.assign('../engineering.html');grid.prepend(hub);main.prepend(dashboard);
 }
 if(requestedTool&&!openedRequestedTool&&toolLabels[requestedTool]){const requested=target(toolLabels[requestedTool]);if(requested){openedRequestedTool=true;active='module';requested.click();}}
 main.classList.toggle('ex-overview-mode',active==='overview');document.getElementById('ex-overview-button')?.classList.toggle('ex-current',active==='overview');
 // The legacy floating print toolkit stays available as a compact panel.
 const toolkit=[...document.querySelectorAll('h4')].find(h=>h.textContent.includes('QC / Print Toolkit'));
 if(toolkit)toolkit.parentElement.classList.add('ex-print-toolkit');
 if(toolkit&&!toolkit.dataset.exCompact){toolkit.dataset.exCompact='1';const b=toolkit.querySelector('button');if(b&&b.textContent.trim()==='–')b.click();}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});sync();
})();
