import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const cors = {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS"};
export const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
export async function requireTester(req:Request):Promise<boolean>{
  const bearer=req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const allowed=Deno.env.get("RAZORPAY_TEST_ALLOWED_EMAIL")?.trim().toLowerCase();
  if(!bearer||!allowed)return false;
  const url=Deno.env.get("SUPABASE_URL")??"";
  const anon=Deno.env.get("SUPABASE_ANON_KEY")??"";
  if(!url||!anon)return false;
  const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.getUser(bearer);
  return !error&&!!data.user?.email&&data.user.email.toLowerCase()===allowed;
}
