
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS"};
const prices: Record<string,string> = {Car:"RAZORPAY_TEST_CAR_PAISE",Bike:"RAZORPAY_TEST_BIKE_PAISE",Scooter:"RAZORPAY_TEST_SCOOTER_PAISE",Auto:"RAZORPAY_TEST_AUTO_PAISE"};
const json = (body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

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
  if(!(await requireTester(req))) return json({error:"Sign in with the authorized test email"},401);
  try {
    const keyId=Deno.env.get("RAZORPAY_TEST_KEY_ID")??"";
    const secret=Deno.env.get("RAZORPAY_TEST_KEY_SECRET")??"";
    if(!keyId.startsWith("rzp_test_")||!secret) return json({error:"Test credentials not configured"},503);
    const {vehicle}=await req.json();
    if(typeof vehicle!=="string"||!(vehicle in prices)) return json({error:"Invalid vehicle"},400);
    const amount=Number(Deno.env.get(prices[vehicle]));
    if(!Number.isSafeInteger(amount)||amount<100||amount>10000000) return json({error:"Admin must configure the test advance amount in paise"},503);
    const response=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{"Authorization":"Basic "+btoa(keyId+":"+secret),"Content-Type":"application/json"},body:JSON.stringify({amount,currency:"INR",receipt:crypto.randomUUID().slice(0,36),notes:{vehicle,purpose:"test_booking_advance"}})});
    const order=await response.json();
    if(!response.ok||!order.id) return json({error:"Razorpay test order creation failed"},502);
    const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const {error}=await supabase.from("razorpay_test_payments").insert({razorpay_order_id:order.id,vehicle_type:vehicle,amount_paise:amount});
    if(error) return json({error:"Order created but could not be recorded; do not pay this order"},500);
    return json({keyId,orderId:order.id,amount,currency:"INR"});
  }catch{return json({error:"Could not create test order"},500)}
});
