import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = {};
fs.readFileSync(".env", "utf8").split("\n").forEach(line => {
  const [k, ...v] = line.trim().split("=");
  if (k && v.length) env[k] = v.join("=").replace(/^['"]|['"]$/g, "");
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc("is_staff", { _user_id: "00000000-0000-0000-0000-000000000000" });
  console.log("is_staff rpc result:", error ? error.message : data);
}
check();
