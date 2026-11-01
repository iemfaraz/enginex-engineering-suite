import{client,profile,url,check}from './enginex-cloud.js';
export async function start(){
 document.documentElement.style.visibility='hidden';
 try{
 const me=await profile();
 const raw={get:Storage.prototype.getItem,set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,key:Storage.prototype.key};
 const prefix='enginex-cloud:'+me.id+':';let revision=0,timer,busy=false;
 const excluded=k=>/session|users_v4|^__|^sb-/i.test(k);
 function snapshot(){const data={};for(let i=0;i<localStorage.length;i++){const k=raw.key.call(localStorage,i);if(k?.startsWith(prefix)&&!excluded(k.slice(prefix.length)))data[k.slice(prefix.length)]=raw.get.call(localStorage,k);}return data;}
 const stored=check(await client.from('enginex_workspaces').select('data').eq('user_id',me.id).maybeSingle());
 if(!raw.get.call(localStorage,prefix+'__dirty')){for(const k of Object.keys(snapshot()))raw.remove.call(localStorage,prefix+k);for(const [k,v] of Object.entries(stored?.data||{}))if(typeof v==='string'&&!excluded(k))raw.set.call(localStorage,prefix+k,v);}
 let note;
 const status=text=>{if(note)note.firstChild.textContent=text+' · ';};
 async function save(){if(busy)return;busy=true;const version=revision;status('Saving cloud backup');try{await profile();check(await client.from('enginex_workspaces').upsert({user_id:me.id,data:snapshot(),updated_at:new Date().toISOString()}));if(version===revision)raw.remove.call(localStorage,prefix+'__dirty');status('Cloud backup saved');}catch{status('Cloud backup failed — export a local copy');}finally{busy=false;if(version!==revision)queue();}}
 function queue(){revision++;raw.set.call(localStorage,prefix+'__dirty','1');clearTimeout(timer);timer=setTimeout(save,1300);}
 Storage.prototype.getItem=function(k){if(this===localStorage&&k==='enginex_users_v4')return null;return raw.get.call(this,this===localStorage?prefix+k:k);};
 Storage.prototype.setItem=function(k,v){if(this===localStorage&&k==='enginex_users_v4')return;raw.set.call(this,this===localStorage?prefix+k:k,String(v));if(this===localStorage&&!excluded(k))queue();};
 Storage.prototype.removeItem=function(k){raw.remove.call(this,this===localStorage?prefix+k:k);if(this===localStorage&&!excluded(k))queue();};
 localStorage.setItem('copperline_session_user',JSON.stringify({id:me.id,username:me.email,displayName:me.full_name||me.email,role:me.role==='admin'?'Admin':'Engineer'}));
 function mount(){const header=document.querySelector('#root>.engx-pro-workspace>header');if(!header||note?.isConnected)return;note=document.createElement('div');note.id='ex-cloud-banner';note.style.cssText='padding:8px 24px;background:#fff6e9;color:#765128;font:12px Segoe UI,sans-serif';note.append(document.createTextNode('Account workspace · '));const a=document.createElement('a');a.href=url('dashboard.html');a.textContent=me.role==='admin'?'Admin dashboard →':'My dashboard →';note.append(a);header.append(note);}
 let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}}).observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const text=b.textContent+' '+b.title;if(/Users & Access|Home Portal|Home Cover/i.test(text)){e.preventDefault();e.stopImmediatePropagation();location.assign(url('dashboard.html'));}else if(/Sign Out/i.test(text)){e.preventDefault();e.stopImmediatePropagation();clearTimeout(timer);await save();const result=await client.auth.signOut();if(result.error){status('Sign out failed — try again');return;}location.replace(url('account-login.html'));}},true);
 window.addEventListener('online',save);window.addEventListener('beforeunload',e=>{if(raw.get.call(localStorage,prefix+'__dirty')){e.preventDefault();e.returnValue='';}});
 setInterval(()=>profile().catch(()=>location.replace(url('dashboard.html'))),60000);
 if(raw.get.call(localStorage,prefix+'__dirty'))queue();
 document.documentElement.style.visibility='';
 }catch(e){location.replace(url('dashboard.html'));await new Promise(()=>{});}
}
