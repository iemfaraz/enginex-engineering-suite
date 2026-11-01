import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const config=window.ENGINEX_CLOUD||{};
export const configured=!!(config.url&&config.publishableKey);
export const client=configured?createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export const base=new URL('../',import.meta.url);
export const url=p=>new URL(p,base).href;
export async function profile(){
 if(!client)throw Error('Cloud accounts are awaiting setup.');
 const {data:{user},error}=await client.auth.getUser();if(error||!user)throw Error('Please sign in to continue.');
 const result=await client.from('enginex_profiles').select('*').eq('id',user.id).single();if(result.error)throw result.error;
 if(result.data.status!=='active')throw Error('Your account is awaiting administrator approval or has been suspended.');
 return result.data;
}
export function check(result){if(result.error)throw result.error;return result.data;}
