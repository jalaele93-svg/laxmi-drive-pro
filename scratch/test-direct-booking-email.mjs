import { sendBookingConfirmationEmailDirect } from "../src/lib/booking-email.server.ts";

async function test() {
  console.log("Calling sendBookingConfirmationEmailDirect...");
  const res = await sendBookingConfirmationEmailDirect({
    bookingRef: "LDT-TEST-999",
    customerName: "Test User",
    customerEmail: "frameflicks00@gmail.com",
    mobile: "9416055858",
    vehicleType: "Car",
    experience: "Beginner",
    date: "2026-10-17",
    time: "10:00 AM",
    message: "Direct API test message",
    paymentChoice: "UPI",
  });
  console.log("Result:", res);
}

test();
