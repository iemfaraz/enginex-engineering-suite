import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile(new URL('../assets/enginex-cloud.js',import.meta.url),'utf8')).replace(/^import .*;\n/,'').replaceAll('export ','').replace('import.meta.url',JSON.stringify('https://iemfaraz.github.io/enginex-engineering-suite/assets/enginex-cloud.js'))+'\nglobalThis.testApi={profile,configured,url};';
function setup({configured=true,user={id:'one'},status='active',failure=null}={}){let requested;const context={URL,window:{ENGINEX_CLOUD:configured?{url:'https://example.supabase.co',publishableKey:'public-key'}:{}},createClient:()=>({auth:{getUser:async()=>({data:{user}})},from:()=>({select:()=>({eq:(column,value)=>{requested={column,value};return{single:async()=>({data:{id:'one',status,role:'user'},error:failure})};}})})})};vm.runInNewContext(source,context);return{...context.testApi,requested:()=>requested};}
test('cloud client stays disabled until a project is configured',async()=>{const api=setup({configured:false});assert.equal(api.configured,false);await assert.rejects(api.profile(),/awaiting setup/);});
test('cloud access requires an authenticated user',async()=>{await assert.rejects(setup({user:null}).profile(),/sign in/);});
test('pending and suspended accounts cannot open a workspace',async()=>{for(const status of ['pending','suspended'])await assert.rejects(setup({status}).profile(),/approval|suspended/);});
test('active account profile is retrieved for the authenticated user ID',async()=>{const api=setup();assert.equal((await api.profile()).id,'one');assert.equal(api.requested().column,'id');assert.equal(api.requested().value,'one');assert.equal(api.url('dashboard.html'),'https://iemfaraz.github.io/enginex-engineering-suite/dashboard.html');});
test('profile lookup failures deny workspace entry',async()=>{await assert.rejects(setup({failure:new Error('database unavailable')}).profile(),/database unavailable/);});
