import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = {};
fs.readFileSync(".env", "utf8").split("\n").forEach(line => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) env[k] = v.join("=").replace(/^['"]|['"]$/g, "");
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);

async function check() {
  // Try inserting with payment_status = 'Unpaid' in partner_applications
  // We expect either validation/foreign key error or enum error
  const { data, error } = await supabase.from("partner_applications").insert({
    status: "Draft",
    payment_status: "Unpaid"
  });
  console.log("partner_applications insert result:", error);
}
check();
