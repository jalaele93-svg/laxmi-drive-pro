import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = {};
fs.readFileSync(".env", "utf8").split("\n").forEach(line => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) env[k] = v.join("=").replace(/^['"]|['"]$/g, "");
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);

async function test() {
  console.log("Testing insert with payment_status='Paid' and amount=500...");
  const res1 = await supabase.from("lesson_bookings").insert({
    full_name: "Test Paid Learner",
    mobile: "9876543210",
    email: "test@example.com",
    vehicle_type: "Car",
    experience: "Beginner",
    preferred_date: "2026-10-25",
    preferred_time: "10:00:00",
    payment_choice: "UPI",
    payment_status: "Paid",
    amount: 500
  });
  console.log("Insert res error:", res1.error ? res1.error : "Success!");

  console.log("Testing insert with default Unpaid (no select)...");
  const res2 = await supabase.from("lesson_bookings").insert({
    full_name: "Test Normal Learner",
    mobile: "9876543210",
    email: "test@example.com",
    vehicle_type: "Car",
    experience: "Beginner",
    preferred_date: "2026-10-25",
    preferred_time: "10:00:00",
    payment_choice: "UPI"
  });
  console.log("Insert normal res error:", res2.error);

  if (res2.data?.[0]?.id) {
    const id = res2.data[0].id;
    console.log("Testing update on normal row:", id);
    const res3 = await supabase.from("lesson_bookings").update({
      payment_status: "Paid",
      amount: 500
    }).eq("id", id);
    console.log("Update res:", res3.error ? res3.error : "Success!");
  }
}

test();
