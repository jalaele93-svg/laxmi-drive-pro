import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Testing update...");
  const fakeId = "00000000-0000-0000-0000-000000000000";
  const resUpdate = await supabase
    .from("partner_applications")
    .update({ full_name: "Updated Name" })
    .eq("id", fakeId);
  console.log("resUpdate:", resUpdate);

  const resUpdatePayment = await supabase
    .from("partner_applications")
    .update({ payment_status: "Pending" })
    .eq("id", fakeId);
  console.log("resUpdatePayment:", resUpdatePayment);
}

run();
