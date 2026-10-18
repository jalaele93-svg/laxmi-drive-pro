import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);

const host = process.env.NODEMAILER_HOST || "smtp.gmail.com";
const port = Number(process.env.NODEMAILER_PORT || 587);
const user = process.env.NODEMAILER_EMAIL || "frameflicks00@gmail.com";
const pass = process.env.NODEMAILER_PASSWORD || "rxed baqr gfib fjac";

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

async function simulateBooking(testValues) {
  console.log("Simulating booking submission with:", testValues);

  // 1. Submit to Supabase lesson_bookings
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  
  // Mapping logic
  let dbPaymentChoice = "Pay after confirmation";
  if (testValues.paymentChoice === "Razorpay" || testValues.paymentChoice === "UPI") {
    dbPaymentChoice = "UPI";
  } else if (testValues.paymentChoice === "Card") {
    dbPaymentChoice = "Card";
  } else if (testValues.paymentChoice === "Cash") {
    dbPaymentChoice = "Cash";
  }

  const { data, error } = await supabase.from("lesson_bookings").insert({
    full_name: testValues.fullName.trim(),
    mobile: testValues.mobile.trim(),
    email: testValues.email.trim(),
    vehicle_type: testValues.vehicleType,
    experience: testValues.experience,
    preferred_date: tomorrow,
    preferred_time: "10:00:00",
    message: testValues.message || null,
    payment_choice: dbPaymentChoice,
  }).select("id").single();

  if (error) {
    console.error("STEP 1 FAILED - Supabase insert error:", error);
    return;
  }
  console.log("STEP 1 SUCCESS - Booking saved to Supabase! ID:", data.id);

  // 2. Send confirmation email
  const generatedRef = "LDT-BK-" + Math.floor(100000 + Math.random() * 900000);
  console.log("STEP 2 - Sending confirmation email to:", testValues.email);

  const info = await transporter.sendMail({
    from: `"Laxmi Motor Driving School" <${user}>`,
    replyTo: user,
    to: testValues.email,
    bcc: user,
    subject: `Booking Confirmed: Your ${testValues.vehicleType} Driving Training [Ref: #${generatedRef}]`,
    text: `Namaste ${testValues.fullName},\nYour booking #${generatedRef} for ${testValues.vehicleType} training is confirmed!`,
  });

  console.log("STEP 2 SUCCESS - Email sent! MessageId:", info.messageId);
}

simulateBooking({
  fullName: "Simulated Learner",
  mobile: "9876543210",
  email: "frameflicks00@gmail.com",
  vehicleType: "Car",
  experience: "Beginner",
  paymentChoice: "Razorpay",
  message: "Testing mapped paymentChoice and email dispatch",
}).catch(console.error);
