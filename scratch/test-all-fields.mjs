import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const allFields = {
    id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    full_name: "Test Name",
    mobile: "9999999999",
    email: "test@example.com",
    alternate_mobile: null,
    address: "123 Street",
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
    vehicle_color: "White",
    odometer_km: 10000,
    ownership_status: "Individual Owner",
    preferred_location: "Bhubaneswar",
    preferred_use: "Full-time",
    preferred_availability: "Weekdays",
    bank_account_name: null,
    bank_name: null,
    bank_account_number: null,
    bank_ifsc: null,
    upi_id: null,
    terms_accepted: false,
    status: "Draft",
    deposit_amount: 2000,
    payment_status: "Pending",
    payment_method: null,
    payment_reference: null,
    payment_paid_at: null,
    payment_verified_at: null,
    partner_id: null,
    admin_notes: null,
    rejection_reason: null,
    submitted_at: null,
    vehicle_verified: false,
    vehicle_verified_at: null,
    gateway_only: false,
  };

  const res = await supabase.from("partner_applications").insert(allFields);
  console.log("Insert with ALL fields explicitly set:", res.error);
}

run();
