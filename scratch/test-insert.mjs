import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);

async function run() {
  // Let's test minimal insert to see what fails
  console.log("Testing minimal inserts...");

  // Try insert with only required fields
  const id1 = crypto.randomUUID();
  const res1 = await supabase.from("partner_applications").insert({
    id: id1,
    user_id: crypto.randomUUID(),
    full_name: "Test",
    mobile: "9999999999",
    email: "test@example.com",
    address: "addr",
    city: "city",
    district: "dist",
    state: "state",
    pincode: "123456",
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
  });
  console.log("res1 (default payment_status):", res1.error);

  const id2 = crypto.randomUUID();
  const res2 = await supabase.from("partner_applications").insert({
    id: id2,
    user_id: crypto.randomUUID(),
    full_name: "Test",
    mobile: "9999999999",
    email: "test@example.com",
    address: "addr",
    city: "city",
    district: "dist",
    state: "state",
    pincode: "123456",
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
    payment_status: "Pending",
  });
  console.log("res2 (payment_status: 'Pending'):", res2.error);

  const id3 = crypto.randomUUID();
  const res3 = await supabase.from("partner_applications").insert({
    id: id3,
    user_id: crypto.randomUUID(),
    full_name: "Test",
    mobile: "9999999999",
    email: "test@example.com",
    address: "addr",
    city: "city",
    district: "dist",
    state: "state",
    pincode: "123456",
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
    payment_status: "Paid",
  });
  console.log("res3 (payment_status: 'Paid'):", res3.error);

  const id4 = crypto.randomUUID();
  const res4 = await supabase.from("partner_applications").insert({
    id: id4,
    user_id: crypto.randomUUID(),
    full_name: "Test",
    mobile: "9999999999",
    email: "test@example.com",
    address: "addr",
    city: "city",
    district: "dist",
    state: "state",
    pincode: "123456",
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
    payment_status: "Unpaid",
  });
  console.log("res4 (payment_status: 'Unpaid'):", res4.error);
}

run();
