import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const scrypt=promisify(scryptCallback),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const cliPort=process.argv.includes('--port')?process.argv[process.argv.indexOf('--port')+1]:undefined;
const port=Number(process.env.PORT||cliPort||3000),host=process.env.HOST||'0.0.0.0';
const production=process.env.NODE_ENV==='production', dbPath=resolve(process.env.DATABASE_PATH||resolve(root,'data/enginex.sqlite'));
await mkdir(dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'Engineer',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS workspaces(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,data TEXT NOT NULL,updated_at TEXT NOT NULL);`);
const hashToken=t=>createHash('sha256').update(t).digest('hex');
async function passwordHash(p){const salt=randomBytes(16).toString('hex');return salt+':'+(await scrypt(p,salt,64)).toString('hex');}
async function verify(p,stored){const[salt,hex]=stored.split(':');const h=await scrypt(p,salt,64);return timingSafeEqual(h,Buffer.from(hex,'hex'));}
const dummyHash=await passwordHash(randomBytes(32).toString('hex'));
const profile=u=>({id:u.id,email:u.email,username:u.email,displayName:u.name,role:u.role,title:u.role,createdAt:u.created_at});
if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){
 const email=process.env.ADMIN_EMAIL.trim().toLowerCase();
 if(process.env.ADMIN_PASSWORD.length<12)throw Error('ADMIN_PASSWORD must contain at least 12 characters');
 if(!db.prepare('SELECT id FROM users WHERE email=?').get(email))db.prepare('INSERT INTO users VALUES(?,?,?,?,?,1,?)').run(randomBytes(16).toString('hex'),email,'ENGINEX Administrator',await passwordHash(process.env.ADMIN_PASSWORD),'Administrator',new Date().toISOString());
}
const buckets=new Map();
function limit(key,max=12){const now=Date.now();let b=buckets.get(key);if(!b||b.until<now){b={count:0,until:now+15*60e3};buckets.set(key,b);}return ++b.count<=max;}
const cleanup=setInterval(()=>{const now=Date.now();for(const[k,b]of buckets)if(b.until<now)buckets.delete(k);db.prepare('DELETE FROM sessions WHERE expires < ?').run(now);},60000);cleanup.unref();
function session(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('enginex_session='))?.slice(16);if(!token)return null;const row=db.prepare('SELECT s.*,u.email,u.name,u.role,u.active,u.created_at FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires>? AND u.active=1').get(hashToken(token),Date.now());return row?{...row,id:row.user_id}:null;}
function headers(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');res.setHeader('Cache-Control','no-store');if(production)res.setHeader('Strict-Transport-Security','max-age=31536000');}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
function fail(status,message){throw Object.assign(new Error(message),{status});}
async function body(req,max=1024*1024*5){let n=0,s='';for await(const chunk of req){n+=chunk.length;if(n>max)fail(413,'Request too large');s+=chunk;}try{return JSON.parse(s||'{}');}catch{fail(400,'Invalid JSON');}}
function sameOrigin(req){const expected=process.env.APP_ORIGIN||`${production?'https':'http'}://${req.headers.host}`;if(req.headers.origin!==expected)fail(403,'Origin rejected');}
const cookie=(token,age)=>`enginex_session=${token}; Path=/; HttpOnly; SameSite=Strict${production?'; Secure':''}; Max-Age=${age}`;
async function issue(res,u,remember){const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex'),age=remember?604800:28800;db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hashToken(token),u.id,csrf,Date.now()+age*1000);res.setHeader('Set-Cookie',cookie(token,age));json(res,200,{user:profile(u),csrf});}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.mp4':'video/mp4','.svg':'image/svg+xml'};
export const server=http.createServer(async(req,res)=>{headers(res);try{
 const path=new URL(req.url,'http://localhost').pathname,method=req.method,u=session(req);
 if(path.startsWith('/api/')){
  if(method!=='GET')sameOrigin(req);
  if(path==='/api/health'&&method==='GET')return json(res,200,{status:'ok'});
  if(['/api/auth/login','/api/auth/register'].includes(path)&&method==='POST'){
   // Use the socket address; forwarded headers are not trusted by default.
   if(!limit('ip:'+req.socket.remoteAddress,100))fail(429,'Too many requests. Try again in 15 minutes.');
   const b=await body(req,16384),email=String(b.email||'').trim().toLowerCase(),p=String(b.password||'');
   if(!limit('account:'+email,12))fail(429,'Too many attempts. Try again in 15 minutes.');
   if(email.length>254||p.length>256)fail(400,'Invalid credentials');
   if(path.endsWith('/register')){
    const name=String(b.name||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||name.length<2||name.length>100||p.length<12)fail(400,'Enter a valid name, email and password of at least 12 characters.');
    const id=randomBytes(16).toString('hex'),password=await passwordHash(p);
    try{db.prepare('INSERT INTO users VALUES(?,?,?,?,?,1,?)').run(id,email,name,password,'Engineer',new Date().toISOString());}catch(e){if(e.code?.includes('SQLITE'))fail(409,'Unable to create account with these details');throw e;}
    return issue(res,db.prepare('SELECT * FROM users WHERE id=?').get(id),false);
   }
   const account=db.prepare('SELECT * FROM users WHERE email=?').get(email),ok=await verify(p,account?.password||dummyHash);
   if(!account||!account.active||!ok)fail(401,'Email or password is incorrect');
   return issue(res,account,!!b.remember);
  }
  if(!u)fail(401,'Please sign in');
  if(method!=='GET'&&req.headers['x-csrf-token']!==u.csrf)fail(403,'Session verification failed');
  if(path==='/api/auth/me'&&method==='GET')return json(res,200,{user:profile(u),csrf:u.csrf});
  if(path==='/api/auth/logout'&&method==='POST'){db.prepare('DELETE FROM sessions WHERE token=?').run(u.token);res.setHeader('Set-Cookie',cookie('',0));return json(res,200,{ok:true});}
  if(path==='/api/auth/password'&&method==='POST'){
   if(!limit('password:'+u.id,8))fail(429,'Too many attempts');
   const b=await body(req,16384),p=String(b.password||''),old=String(b.currentPassword||'');
   if(p.length<12||p.length>256||old.length>256)fail(400,'New password must be 12–256 characters');
   const account=db.prepare('SELECT * FROM users WHERE id=?').get(u.id);if(!await verify(old,account.password))fail(401,'Current password is incorrect');
   db.prepare('UPDATE users SET password=? WHERE id=?').run(await passwordHash(p),u.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);res.setHeader('Set-Cookie',cookie('',0));return json(res,200,{ok:true});
  }
  if(path==='/api/projects/workspace'&&method==='GET'){const row=db.prepare('SELECT data,updated_at FROM workspaces WHERE user_id=?').get(u.id);return json(res,200,{data:row?JSON.parse(row.data):{},updatedAt:row?.updated_at||null});}
  if(path==='/api/projects/workspace'&&method==='PUT'){
   const b=await body(req);if(!b.data||Array.isArray(b.data)||typeof b.data!=='object')fail(400,'Invalid workspace');
   const entries=Object.entries(b.data);if(entries.length>500||entries.some(([k,v])=>typeof v!=='string'||k.length>150||/session|users_v4/i.test(k)))fail(400,'Invalid workspace values');
   db.prepare('INSERT INTO workspaces VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').run(u.id,JSON.stringify(b.data),new Date().toISOString());return json(res,200,{ok:true});
  }
  if(path==='/api/admin/users'&&method==='GET'){if(u.role!=='Administrator')fail(403,'Administrator access required');return json(res,200,{users:db.prepare('SELECT id,email,name,role,active,created_at FROM users ORDER BY created_at DESC').all()});}
  if(path.startsWith('/api/admin/users/')&&method==='PATCH'){
   if(u.role!=='Administrator')fail(403,'Administrator access required');const id=path.split('/').pop(),b=await body(req,4096);if(id===u.id)fail(400,'You cannot change your own access');
   if(!['Administrator','Engineer'].includes(b.role)||typeof b.active!=='boolean')fail(400,'Invalid role or active status');
   const r=db.prepare('UPDATE users SET role=?,active=? WHERE id=?').run(b.role,b.active?1:0,id);if(!r.changes)fail(404,'User not found');db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);return json(res,200,{ok:true});
  }
  fail(404,'Endpoint not found');
 }
 if(!['GET','HEAD'].includes(method))fail(405,'Method not allowed');
 if(path==='/'||path==='/index.html'){res.writeHead(302,{Location:u?'/app/workspace.html':'/login.html'});return res.end();}
 const publicFiles=new Set(['/login.html','/assets/enginex-interface.css','/assets/enginex-login.js','/assets/enginex-login.css','/assets/enginex-login-reference.png']);
 if(!publicFiles.has(path)&&!u){res.writeHead(302,{Location:'/login.html'});return res.end();}
 // Explicit allow-list: database, server, tests and configuration cannot be downloaded.
 if(path!=='/account.html'&&!publicFiles.has(path)&&!/^\/(app\/[a-z0-9-]+\.html|assets\/[a-z0-9-]+\.(png|mp4|css|js))$/.test(path))fail(404,'Not found');
 const file=resolve(root,'.'+path);let bytes;try{bytes=await readFile(file);}catch{fail(404,'Not found');}
 if(path.startsWith('/app/')&&path.endsWith('.html')){
  const saved=db.prepare('SELECT data FROM workspaces WHERE user_id=?').get(u.id);
  const bootstrap=JSON.stringify({user:profile(u),csrf:u.csrf,workspace:saved?JSON.parse(saved.data):null}).replace(/</g,'\\u003c');
  bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>window.__ENGINEX_AUTH__='+bootstrap+';</script><script src="/assets/enginex-auth.js"></script>'));
 }
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Content-Length':bytes.length});res.end(method==='HEAD'?undefined:bytes);
 }catch(e){json(res,e.status||500,{error:e.status?e.message:'Server error'});if(!e.status)console.error(e);}});
if(process.env.ENGINEX_TEST!=='1')server.listen(port,host,()=>console.log(`ENGINEX listening on port ${port}`));
