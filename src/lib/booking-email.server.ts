import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env["NODEMAILER_HOST"] || "smtp.gmail.com";
  const port = Number(process.env["NODEMAILER_PORT"] || 465);
  const user = process.env["NODEMAILER_EMAIL"] || "frameflicks00@gmail.com";
  const pass = process.env["NODEMAILER_PASSWORD"] || "rxed baqr gfib fjac";

  return {
    user,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    }),
  };
}

export type NewBookingPayload = {
  bookingRef: string;
  customerName: string;
  customerEmail?: string;
  mobile: string;
  vehicleType: string;
  experience: string;
  date: string;
  time: string;
  message?: string;
  paymentChoice?: string;
  paymentStatus?: "Unpaid" | "Paid" | "Pending verification" | string;
  paymentId?: string;
  amountPaid?: number;
};

const ADMIN_NOTIFICATION_EMAILS = ["inofdriving@gmail.com", "frameflicks00@gmail.com"];

export async function sendBookingConfirmationEmailDirect(data: NewBookingPayload) {
  const { user, transporter } = getTransporter();
  const customerName = data.customerName?.trim() || "Learner";
  const bookingRef = data.bookingRef?.trim() || "REF";
  const vehicleType = data.vehicleType?.trim() || "Training";
  const experience = data.experience?.trim() || "Beginner";
  const date = data.date?.trim() || "Scheduled";
  const time = data.time?.trim() || "To be confirmed";
  const mobile = data.mobile?.trim() || "";
  const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
  const rawEmail = data.customerEmail?.trim().toLowerCase() || "";
  const hasValidCustomerEmail = Boolean(rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail));
  const paymentChoice = data.paymentChoice?.trim() || "Decide after confirmation call";
  const message = data.message?.trim() || "";
  const isPaid = data.paymentStatus === "Paid" || Boolean(data.paymentId);
  const amountPaid = data.amountPaid || 500;
  const paymentId = data.paymentId?.trim() || "";

  let adminEmailSent = false;
  let customerEmailSent = false;
  let errorMsg = "";

  // 1. ALWAYS SEND INSTANT NOTIFICATION TO BUSINESS OWNER / ADMIN
  try {
    const adminSubject = isPaid
      ? `💰 [PAID ₹${amountPaid.toLocaleString("en-IN")}] New Booking: ${customerName} (${mobile}) - ${vehicleType} [#${bookingRef}]`
      : `🚗 [New Booking - ${paymentChoice}] ${customerName} (${mobile}) - ${vehicleType} [#${bookingRef}]`;

    const adminPlainText = `
======================================================
NEW DRIVING LESSON BOOKING ALERT - LAXMI DRIVING TRAINING
======================================================

Customer Details:
• Name: ${customerName}
• Mobile: ${mobile} (WhatsApp: https://wa.me/91${cleanMobile})
• Email: ${hasValidCustomerEmail ? rawEmail : "Not provided"}

Training Details:
• Vehicle: ${vehicleType} Training
• Experience Level: ${experience}
• Preferred Date & Time: ${date} at ${time}
• Booking Reference: #${bookingRef}

Payment Details:
• Payment Preference: ${paymentChoice}
• Payment Status: ${isPaid ? `PAID (₹${amountPaid.toLocaleString("en-IN")} via Razorpay | ID: ${paymentId})` : "UNPAID / Cash or Pay after confirmation"}

${message ? `Special Customer Notes:\n${message}\n\n` : ""}
Action Required:
Call learner on ${mobile} to confirm batch time and instructor assignment.
Website: https://laxmidriving.com
`;

    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <tr style="background: linear-gradient(135deg, #1E40E7 0%, #172554 100%); color: #ffffff;">
      <td style="padding: 24px; text-align: left;">
        <span style="display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;">
          New Booking Notification
        </span>
        <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Laxmi Driving Training</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Booking Ref: <strong>#${bookingRef}</strong></p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <!-- Quick Action Buttons -->
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #1e3a8a;">Contact Customer Immediately:</p>
          <div style="display: flex; gap: 10px;">
            <a href="tel:${mobile}" style="display: inline-block; background: #1E40E7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 6px; margin-right: 8px;">
              📞 Call ${mobile}
            </a>
            <a href="https://wa.me/91${cleanMobile}?text=Hello%20${encodeURIComponent(customerName)}%2C%20this%20is%20Laxmi%20Driving%20Training%20regarding%20your%20${encodeURIComponent(vehicleType)}%20lesson%20booking%20%23${bookingRef}." style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 6px;">
              💬 WhatsApp
            </a>
          </div>
        </div>

        <!-- Details Table -->
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; width: 38%;">Learner Name</td>
            <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${customerName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Mobile Number</td>
            <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${mobile}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Email</td>
            <td style="padding: 10px 0; color: #0f172a;">${hasValidCustomerEmail ? rawEmail : "<em>Not provided</em>"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Vehicle Training</td>
            <td style="padding: 10px 0; font-weight: 700; color: #1E40E7;">${vehicleType} Training</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Experience Level</td>
            <td style="padding: 10px 0; color: #0f172a;">${experience}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Preferred Date & Time</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${date} at ${time}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Payment Preference</td>
            <td style="padding: 10px 0; font-weight: 700; color: ${isPaid ? "#15803d" : "#b45309"};">
              ${paymentChoice} ${isPaid ? `(PAID ₹${amountPaid.toLocaleString("en-IN")})` : "(Unpaid)"}
            </td>
          </tr>
          ${isPaid && paymentId ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Razorpay Payment ID</td>
            <td style="padding: 10px 0; font-family: monospace; font-size: 13px; color: #0f172a;">${paymentId}</td>
          </tr>` : ""}
          ${message ? `
          <tr>
            <td style="padding: 10px 0; color: #64748b; vertical-align: top;">Special Notes</td>
            <td style="padding: 10px 0; color: #0f172a;">${message}</td>
          </tr>` : ""}
        </table>

        <div style="background: #f8fafc; border-radius: 8px; padding: 12px; font-size: 12px; color: #64748b; text-align: center;">
          Received on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST via Laxmi Driving Portal.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const adminInfo = await transporter.sendMail({
      from: `"Laxmi Driving Alert" <${user}>`,
      replyTo: hasValidCustomerEmail ? rawEmail : user,
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: adminSubject,
      text: adminPlainText,
      html: adminHtml,
    });
    console.log(`[Admin Booking Alert Sent] MessageId: ${adminInfo.messageId} to ${ADMIN_NOTIFICATION_EMAILS.join(", ")}`);
    adminEmailSent = true;
  } catch (err: unknown) {
    console.error("[Admin Alert Email Error]", err);
    errorMsg = err instanceof Error ? err.message : "Failed to send admin notification email.";
  }

  // 2. IF CUSTOMER PROVIDED AN EMAIL, SEND THE CUSTOMER CONFIRMATION RECEIPT
  if (hasValidCustomerEmail) {
    try {
      const customerSubject = isPaid
        ? `✓ Payment Confirmed (₹${amountPaid.toLocaleString("en-IN")}) & Booking Confirmed [Ref: #${bookingRef}]`
        : `Booking Confirmed: Your ${vehicleType} Driving Training [Ref: #${bookingRef}]`;

      const customerPlainText = `
LAXMI MOTOR DRIVING TRAINING SCHOOL - ${isPaid ? "PAYMENT & BOOKING CONFIRMATION" : "BOOKING CONFIRMATION"}
Plot No.-101, Palaspur, Main Road, PS.-Pattapur, Distt.-Ganjam, Odisha - 761013

Namaste ${customerName},

${
  isPaid
    ? `Thank you! We have successfully received your payment of ₹${amountPaid.toLocaleString("en-IN")} via Razorpay. Your driving training booking is confirmed and prioritized.`
    : `Thank you for choosing Laxmi Motor Driving Training School! Your driving training enquiry has been received and confirmed.`
}

YOUR BOOKING DETAILS:
------------------------------------------------
• Booking Reference: #${bookingRef}
• Vehicle Training: ${vehicleType} Training
• Experience Level: ${experience}
• Preferred Date & Time: ${date} at ${time}
• Contact Mobile: ${mobile}
• Payment Preference: ${paymentChoice}
${isPaid ? `• Payment Status: PAID (Verified via Razorpay)\n• Payment ID: ${paymentId}\n• Amount Paid: ₹${amountPaid.toLocaleString("en-IN")}\n` : ""}
${message ? `• Special Notes: ${message}\n` : ""}

WHAT HAPPENS NEXT?
1. Instructor Call: Our senior trainer will call you shortly on ${mobile} to confirm your batch timing and pickup point.
2. Practice Vehicles: Certified dual-control training cars, bike track cones & safety gear.
3. Licence Assistance: Complete guidance on learner licence and permanent licence RTO test.

NEED HELP?
• Phone / Helpline: +91 98617 04224
• WhatsApp: +91 98617 04224
• Office: Plot No.-101, Palaspur, Main Road, PS.-Pattapur, Distt.-Ganjam, Odisha - 761013
• Website: https://laxmidriving.com

Thank you,
Laxmi Motor Driving Training School
`;

      const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isPaid ? "Payment & Booking Confirmation" : "Booking Confirmation"} - Laxmi Driving School</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E40E7 0%, #172554 100%); padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Laxmi Motor Driving Training School
              </h1>
              <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 14px;">
                Government Approved Driving Training · Distt.-Ganjam & Rayagada, Odisha
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="font-size: 16px; margin: 0 0 16px; color: #334155;">
                Namaste <strong>${customerName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
                ${
                  isPaid
                    ? `Thank you! We have successfully received your payment of <strong>₹${amountPaid.toLocaleString("en-IN")}</strong> via Razorpay. Your driving lesson batch is confirmed and prioritized.`
                    : `Thank you for choosing <strong>Laxmi Motor Driving Training School</strong>! Your driving training enquiry has been received and confirmed.`
                }
              </p>

              <!-- Success Card -->
              <div style="background-color: #dcfce7; border: 1.5px solid #86efac; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                <span style="display: inline-block; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; color: #15803d; margin-bottom: 6px;">
                  ${isPaid ? "Payment Verified & Booking Confirmed" : "Booking Status"}
                </span>
                <div style="font-size: 22px; font-weight: 800; color: #15803d;">
                  ${isPaid ? `✓ ₹${amountPaid.toLocaleString("en-IN")} Paid via Razorpay` : "✓ Booking Received & Confirmed"}
                </div>
                <p style="margin: 8px 0 0; font-size: 14px; line-height: 1.5; color: #15803d;">
                  ${isPaid && paymentId ? `Payment ID: <strong style="font-family: monospace;">${paymentId}</strong><br>` : ""}
                  Reference ID: <strong style="font-family: monospace; font-size: 15px;">#${bookingRef}</strong>
                </p>
              </div>

              <!-- Full Booking Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8fafc;">
                  <td colspan="2" style="padding: 12px 16px; font-weight: 700; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    Your Booking Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">
                    Booking Reference
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    #${bookingRef}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Vehicle Training
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${vehicleType} Training
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Experience Level
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${experience}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Preferred Date & Time
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${date} at ${time}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Contact Mobile
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${mobile}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Payment Status
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: ${isPaid ? "#15803d" : "#0f172a"}; border-bottom: 1px solid #e2e8f0;">
                    ${isPaid ? `✓ PAID (₹${amountPaid.toLocaleString("en-IN")} via Razorpay)` : paymentChoice}
                  </td>
                </tr>
                ${
                  isPaid && paymentId
                    ? `<tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Payment Transaction ID
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-family: monospace; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${paymentId}
                  </td>
                </tr>`
                    : ""
                }
                ${
                  message
                    ? `<tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Special Notes
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${message}
                  </td>
                </tr>`
                    : ""
                }
              </table>

              <!-- Next Steps Card -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <p style="margin: 0 0 10px; font-weight: 700; font-size: 14px; color: #0f172a;">
                  What Happens Next?
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                  <li><strong>Instructor Call:</strong> Our senior trainer will call you shortly on <strong>${mobile}</strong> to confirm your batch and pick-up point.</li>
                  <li><strong>Practice Vehicles:</strong> Certified dual-control cars, bike track cones & safety gear.</li>
                  <li><strong>Licence Assistance:</strong> Complete guidance on learner licence and permanent licence RTO test.</li>
                </ul>
              </div>

              <!-- Contact Box -->
              <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; border: 1px solid #bfdbfe; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-weight: 700; font-size: 14px; color: #1e3a8a;">
                  Need Immediate Help or Directions?
                </p>
                <p style="margin: 0 0 14px; font-size: 13px; color: #3b82f6; line-height: 1.5;">
                  Call our training helpline or chat directly on WhatsApp.
                </p>
                <div>
                  <a href="tel:+919861704224" style="display: inline-block; background-color: #1E40E7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 6px; margin-right: 8px;">
                    Call: +91 98617 04224
                  </a>
                  <a href="https://wa.me/919861704224" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 6px;">
                    WhatsApp Us
                  </a>
                </div>
              </div>

              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                We look forward to teaching you safe and confident driving. See you at the training session!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 600;">
                Laxmi Motor Driving Training School
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Plot No.-101, Palaspur, Main Road, PS.-Pattapur, Distt.-Ganjam, Odisha - 761013 · <a href="https://laxmidriving.com" style="color: #1E40E7; text-decoration: none;">laxmidriving.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

      const custInfo = await transporter.sendMail({
        from: `"Laxmi Motor Driving School" <${user}>`,
        replyTo: "inofdriving@gmail.com",
        to: rawEmail,
        subject: customerSubject,
        text: customerPlainText,
        html: customerHtml,
      });

      console.log(`[Customer Booking Email Sent] MessageId: ${custInfo.messageId} to ${rawEmail}`);
      customerEmailSent = true;
    } catch (err: unknown) {
      console.error("[Customer Booking Email Error]", err);
    }
  }

  if (adminEmailSent || customerEmailSent) {
    return { success: true, adminEmailSent, customerEmailSent };
  } else {
    return { success: false, error: errorMsg || "Failed to deliver booking emails." };
  }
}

export type StatusUpdatePayload = {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  vehicleType?: string;
  preferredDate?: string;
  preferredTime?: string;
  mobile?: string;
};

export async function sendBookingStatusEmailDirect(data: StatusUpdatePayload) {
  if (!data.customerEmail || !data.customerEmail.includes("@")) {
    return { success: false, error: "No valid recipient email address provided." };
  }

  const { user, transporter } = getTransporter();
  const customerName = data.customerName || "Learner";
  const shortId =
    data.bookingId && data.bookingId.length > 8
      ? data.bookingId.slice(0, 8).toUpperCase()
      : data.bookingId || "REF";
  const newStatus = data.newStatus || "Confirmed";
  const vehicleType = data.vehicleType || "Training";
  const preferredDate = data.preferredDate || "";
  const preferredTime = data.preferredTime || "";
  const mobile = data.mobile || "";

  const plainText = `
LAXMI MOTOR DRIVING TRAINING SCHOOL - BOOKING STATUS UPDATE
Plot No.-101, Palaspur, Main Road, PS.-Pattapur, Distt.-Ganjam, Odisha - 761013

Namaste ${customerName},

The status of your driving training booking has been updated.

CURRENT STATUS: ${newStatus}
Reference: #${shortId}
Vehicle: ${vehicleType}
${preferredDate ? `Date & Time: ${preferredDate} ${preferredTime}\n` : ""}${mobile ? `Mobile: ${mobile}\n` : ""}
If you have questions, please call us at +91 98617 04224.

Thank you,
Laxmi Motor Driving Training School
`;

  try {
    const info = await transporter.sendMail({
      from: `"Laxmi Motor Driving School" <${user}>`,
      replyTo: "inofdriving@gmail.com",
      to: data.customerEmail,
      subject: `Booking Status Update: ${newStatus} [Ref: #${shortId}]`,
      text: plainText,
      html: `<div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px;">
        <h2 style="color: #1E40E7; margin-top: 0;">Laxmi Motor Driving Training School</h2>
        <p>Namaste <strong>${customerName}</strong>,</p>
        <p>Your driving lesson booking status is now: <strong style="color: #15803d; font-size: 16px;">${newStatus}</strong>.</p>
        <p>Booking Reference: <strong>#${shortId}</strong></p>
        <p>Vehicle: <strong>${vehicleType} Training</strong></p>
        ${preferredDate ? `<p>Scheduled: <strong>${preferredDate} ${preferredTime}</strong></p>` : ""}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">
          Helpline: <a href="tel:+919861704224" style="color: #1E40E7;">+91 98617 04224</a> | 
          WhatsApp: <a href="https://wa.me/919861704224" style="color: #16a34a;">+91 98617 04224</a><br>
          Website: <a href="https://laxmidriving.com" style="color: #1E40E7;">laxmidriving.com</a>
        </p>
      </div>`,
    });

    console.log(`[Status Email Sent] MessageId: ${info.messageId} to ${data.customerEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    console.error("[Status Email Send Error]", err);
    const errMessage = err instanceof Error ? err.message : "Failed to send email notification.";
    return { success: false, error: errMessage };
  }
}
