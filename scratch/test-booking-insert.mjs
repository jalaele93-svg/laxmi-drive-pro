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

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing insert with empty email...");
  const resEmptyEmail = await supabase.from("lesson_bookings").insert({
    full_name: "Test Learner No Email",
    mobile: "9876543210",
    email: "",
    vehicle_type: "Car",
    experience: "Beginner",
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "10:00:00",
    message: "Test message",
    payment_choice: "UPI",
  });
  console.log("Empty email insert result error:", resEmptyEmail.error);

  console.log("Testing insert with email...");
  const resWithEmail = await supabase.from("lesson_bookings").insert({
    full_name: "Test Learner With Email",
    mobile: "9876543210",
    email: "test@laxmidriving.com",
    vehicle_type: "Car",
    experience: "Beginner",
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "10:00:00",
    message: "Test message with email",
    payment_choice: "UPI",
  });
  console.log("With email insert result error:", resWithEmail.error);
}

testInsert();
