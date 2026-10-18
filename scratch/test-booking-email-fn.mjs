import nodemailer from "nodemailer";

const host = process.env.NODEMAILER_HOST || "smtp.gmail.com";
const port = Number(process.env.NODEMAILER_PORT || 587);
const user = process.env.NODEMAILER_EMAIL || "frameflicks00@gmail.com";
const pass = process.env.NODEMAILER_PASSWORD || "rxed baqr gfib fjac";

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
});

async function testBookingEmail() {
  const testCustomerEmail = "frameflicks00@gmail.com"; // sending to our test email
  const data = {
    bookingRef: "LDT-BK-999999",
    customerName: "Test Learner",
    customerEmail: testCustomerEmail,
    mobile: "9876543210",
    vehicleType: "Car",
    experience: "Beginner",
    date: "2026-10-20",
    time: "10:00:00",
    message: "Test lesson booking",
    paymentChoice: "Razorpay (UPI / Card)",
  };

  const plainText = `
LAXMI MOTOR DRIVING TRAINING SCHOOL - BOOKING CONFIRMATION
Government Approved Driving School · Rohtak, Haryana

Namaste ${data.customerName},

Thank you for choosing Laxmi Motor Driving Training School! Your driving training enquiry has been received and confirmed.

YOUR BOOKING DETAILS:
------------------------------------------------
• Booking Reference: #${data.bookingRef}
• Vehicle Training: ${data.vehicleType} Training
• Experience Level: ${data.experience}
• Preferred Date & Time: ${data.date} at ${data.time}
• Contact Mobile: ${data.mobile}
• Payment Preference: ${data.paymentChoice || "Cash"}
${data.message ? `• Special Notes: ${data.message}\n` : ""}
WHAT HAPPENS NEXT?
1. Instructor Call: Our senior trainer will call you shortly on ${data.mobile} to confirm your batch timing and pickup point.
2. Practice Vehicles: Certified dual-control training cars, bike track cones & safety gear.
3. Licence Assistance: Complete guidance on learner licence and permanent licence RTO test.

NEED HELP?
• Phone / Helpline: +91 94160 55858
• WhatsApp: +91 94160 55858
• Website: https://laxmidriving.com

Thank you,
Laxmi Motor Driving Training School
Near Old Bus Stand / Ground, Rohtak, Haryana
`;

  try {
    console.log("Sending booking email to:", testCustomerEmail);
    const info = await transporter.sendMail({
      from: `"Laxmi Motor Driving School" <${user}>`,
      replyTo: user,
      to: data.customerEmail,
      bcc: user,
      subject: `Booking Confirmed: Your ${data.vehicleType} Driving Training [Ref: #${data.bookingRef}]`,
      text: plainText,
    });
    console.log("Email sent successfully! MessageId:", info.messageId);
  } catch (e) {
    console.error("Email send error:", e);
  }
}

testBookingEmail();
