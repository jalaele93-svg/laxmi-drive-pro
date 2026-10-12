
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

async function requireTester(req: Request): Promise<boolean> {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const allowed = Deno.env.get("RAZORPAY_TEST_ALLOWED_EMAIL")?.trim().toLowerCase();
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!token || !allowed || !url || !anon) return false;
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  return !error && !!data.user?.email && data.user.email.toLowerCase() === allowed;
}

Deno.serve(async req=>{
 if(req.method==="OPTIONS") return new Response(null,{headers:cors});
 if(req.method!=="POST") return json({error:"Method not allowed"},405);
 if(!(await requireTester(req)))return json({error:"Sign in with the authorized test email"},401);
  if(!(await requireTester(req))) return json({error:"Sign in with the authorized test email"},401);
 try{
  const keyId=Deno.env.get("RAZORPAY_TEST_KEY_ID")??"";
  const secret=Deno.env.get("RAZORPAY_TEST_KEY_SECRET")??"";
  if(!keyId.startsWith("rzp_test_")||!secret) return json({error:"Test mode not configured"},503);
  const {razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=await req.json();
  if(![orderId,paymentId,signature].every(x=>typeof x==="string"&&x.length>0&&x.length<256))return json({error:"Invalid payment response"},400);
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const mac=new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(orderId+"|"+paymentId)));
  const expected=Array.from(mac).map(b=>b.toString(16).padStart(2,"0")).join("");
  if(signature.length!==expected.length||[...expected].reduce((acc,c,i)=>acc|(c.charCodeAt(0)^signature.charCodeAt(i)),0)!==0)return json({error:"Signature invalid"},400);
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:record,error:readError}=await db.from("razorpay_test_payments").select("*").eq("razorpay_order_id",orderId).single();
  if(readError||!record)return json({error:"Unknown order"},404);
  if(record.status==="captured")return json({verified:true,alreadyVerified:true});
  const response=await fetch("https://api.razorpay.com/v1/payments/"+encodeURIComponent(paymentId),{headers:{"Authorization":"Basic "+btoa(keyId+":"+secret)}});
  if(!response.ok)return json({error:"Unable to verify payment status"},502);
  const payment=await response.json();
  if(payment.order_id!==orderId||payment.amount!==record.amount_paise||payment.currency!=="INR"||payment.status!=="captured")return json({error:"Payment not captured or details mismatch"},409);
  const {error:writeError}=await db.from("razorpay_test_payments").update({status:"captured",razorpay_payment_id:paymentId,verified_at:new Date().toISOString()}).eq("razorpay_order_id",orderId).eq("status","created");
  if(writeError)return json({error:"Payment verified but ledger update failed"},500);
  return json({verified:true,paymentId});
 }catch{return json({error:"Payment verification failed"},500)}
});
