import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);

async function test(name, payload) {
  const res = await supabase.from("partner_applications").insert(payload);
  console.log(name, "->", res.error ? res.error.message : "SUCCESS!");
}

async function run() {
  const base = {
    id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    full_name: "Test",
    mobile: "9876543210",
    email: "test@example.com",
    address: "addr",
    city: "city",
    district: "dist",
    state: "Odisha",
    pincode: "751001",
    vehicle_type: "Car",
    registration_number: "OD02X1234",
    vehicle_make: "Make",
    vehicle_model: "Model",
    manufacturing_year: 2022,
    fuel_type: "Petrol",
    transmission: "Manual",
    preferred_location: "loc",
    preferred_use: "use",
    preferred_availability: "avail",
  };

  await test("Test 1 (base only)", base);
  await test("Test 2 (gateway_only: true)", { ...base, id: crypto.randomUUID(), gateway_only: true });
  await test("Test 3 (status: 'Submitted')", { ...base, id: crypto.randomUUID(), status: "Submitted" });
  await test("Test 4 (status: 'Payment Pending')", { ...base, id: crypto.randomUUID(), status: "Payment Pending" });
  await test("Test 5 (terms_accepted: true)", { ...base, id: crypto.randomUUID(), terms_accepted: true });
}

run();
