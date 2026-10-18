import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFiles = [".env.local", ".env"];
const env = {};
for (const file of envFiles) {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        if (!env[k]) env[k] = v;
      }
    }
  }
}

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("lesson_bookings")
    .select("id, full_name, mobile, email, payment_choice, payment_status, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Query error:", error);
  } else {
    console.log("Recent bookings count:", data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
