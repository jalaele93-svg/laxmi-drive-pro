import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking partner_applications with anon client...");
  // Try inserting a dummy row without auth to see what happens
  const dummyId = "00000000-0000-0000-0000-000000000001";
  const { data, error } = await supabase.from("partner_applications").insert({
    id: dummyId,
    user_id: dummyId,
    full_name: "Test",
    mobile: "9876543210",
    email: "test@example.com",
    address: "Test",
    city: "Bhubaneswar",
    district: "Khordha",
    state: "Odisha",
    pincode: "751001",
    vehicle_type: "Car",
    registration_number: "OD02AB1234",
    vehicle_make: "Maruti",
    vehicle_model: "Swift",
    manufacturing_year: 2020,
    fuel_type: "Petrol",
    transmission: "Manual",
    ownership_status: "Individual Owner",
    preferred_location: "Bhubaneswar",
    preferred_use: "Full-time",
    preferred_availability: "Weekdays",
    status: "Draft",
    terms_accepted: false,
  });

  console.log("Insert result (without payment_status):", { data, error });

  const { data: data2, error: error2 } = await supabase.from("partner_applications").insert({
    id: dummyId,
    user_id: dummyId,
    full_name: "Test",
    mobile: "9876543210",
    email: "test@example.com",
    address: "Test",
    city: "Bhubaneswar",
    district: "Khordha",
    state: "Odisha",
    pincode: "751001",
    vehicle_type: "Car",
    registration_number: "OD02AB1234",
    vehicle_make: "Maruti",
    vehicle_model: "Swift",
    manufacturing_year: 2020,
    fuel_type: "Petrol",
    transmission: "Manual",
    ownership_status: "Individual Owner",
    preferred_location: "Bhubaneswar",
    preferred_use: "Full-time",
    preferred_availability: "Weekdays",
    status: "Draft",
    terms_accepted: false,
    payment_status: "Pending",
    deposit_amount: 2000,
  });

  console.log("Insert result (WITH payment_status: 'Pending'):", { data: data2, error: error2 });
}

check().catch(console.error);
