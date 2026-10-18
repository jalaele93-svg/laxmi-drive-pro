import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

console.log("Supabase URL:", url);
const supabase = createClient(url, key);

async function main() {
  const testPhone = "9999912345";
  const testEmail = `${testPhone}@partner.laxmidriving.com`;
  const testPass = "Ldt#1234@P2026";

  console.log("Attempting signIn with test user:", testEmail);
  let authRes = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (authRes.error) {
    console.log("SignIn error:", authRes.error.message);
    return;
  }
  console.log("SignIn successful! User ID:", authRes.data.user?.id);

  const token = authRes.data.session?.access_token;
  const authClient = createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const testAppId = crypto.randomUUID();
  console.log("Testing insert draft into partner_applications with ID:", testAppId);

  const payload = {
    id: testAppId,
    user_id: authRes.data.user.id,
    full_name: "Test Partner",
    mobile: testPhone,
    email: "testpartner@example.com",
    alternate_mobile: "",
    address: "123 Main Road",
    city: "Bhubaneswar",
    district: "Khordha",
    state: "Odisha",
    pincode: "751001",
    vehicle_type: "Car",
    registration_number: "OD-02-AB-1234",
    vehicle_make: "Maruti",
    vehicle_model: "Swift",
    manufacturing_year: 2022,
    fuel_type: "Petrol",
    transmission: "Manual",
    vehicle_color: "White",
    odometer_km: 12000,
    ownership_status: "Individual Owner",
    preferred_location: "Bhubaneswar",
    preferred_use: "Full-time",
    preferred_availability: "Weekdays",
    bank_account_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    upi_id: "",
    status: "Draft",
    terms_accepted: false,
  };

  const res1 = await authClient
    .from("partner_applications")
    .insert(payload)
    .select("id,application_no")
    .single();

  console.log("Insert result (as authenticated user):", res1);
}

main().catch(console.error);
