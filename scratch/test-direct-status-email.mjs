import { sendBookingStatusEmailDirect } from "../src/lib/booking-email.server.ts";

async function test() {
  console.log("Calling sendBookingStatusEmailDirect...");
  const res = await sendBookingStatusEmailDirect({
    bookingId: "test-booking-id-12345678",
    customerEmail: "frameflicks00@gmail.com",
    customerName: "Test Learner",
    newStatus: "Confirmed",
    vehicleType: "Car",
    preferredDate: "2026-10-18",
    preferredTime: "11:00 AM",
    mobile: "9416055858",
  });
  console.log("Result:", res);
}

test();
