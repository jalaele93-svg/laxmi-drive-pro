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
  customerEmail: string;
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

export async function sendBookingConfirmationEmailDirect(data: NewBookingPayload) {
  if (!data.customerEmail || !data.customerEmail.includes("@")) {
    return { success: false, error: "No valid recipient email address provided." };
  }

  const { user, transporter } = getTransporter();
  const customerName = data.customerName || "Learner";
  const bookingRef = data.bookingRef || "REF";
  const vehicleType = data.vehicleType || "Training";
  const experience = data.experience || "Beginner";
  const date = data.date || "Scheduled";
  const time = data.time || "To be confirmed";
  const mobile = data.mobile || "";
  const paymentChoice = data.paymentChoice || "Pay after confirmation";
  const message = data.message || "";
  const isPaid = data.paymentStatus === "Paid" || Boolean(data.paymentId);
  const amountPaid = data.amountPaid || 500;
  const paymentId = data.paymentId || "";

  const subject = isPaid
    ? `✓ Payment Confirmed (₹${amountPaid.toLocaleString("en-IN")}) & Booking Confirmed [Ref: #${bookingRef}]`
    : `Booking Confirmed: Your ${vehicleType} Driving Training [Ref: #${bookingRef}]`;

  const plainText = `
LAXMI MOTOR DRIVING TRAINING SCHOOL - ${isPaid ? "PAYMENT & BOOKING CONFIRMATION" : "BOOKING CONFIRMATION"}
Government Approved Driving School · Rohtak, Haryana

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
• Phone / Helpline: +91 94160 55858
• WhatsApp: +91 94160 55858
• Website: https://laxmidriving.com

Thank you,
Laxmi Motor Driving Training School
Near Old Bus Stand / Ground, Rohtak, Haryana
`;

  const htmlContent = `
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
                Government Approved Driving Training · Rohtak, Haryana
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
                  <a href="tel:+919416055858" style="display: inline-block; background-color: #1E40E7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 6px; margin-right: 8px;">
                    Call: +91 94160 55858
                  </a>
                  <a href="https://wa.me/919416055858" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 6px;">
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
                Near Old Bus Stand / Ground, Rohtak, Haryana · <a href="https://laxmidriving.com" style="color: #1E40E7; text-decoration: none;">laxmidriving.com</a>
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

  const bcc = data.customerEmail.toLowerCase() === user.toLowerCase() ? undefined : user;
  try {
    const info = await transporter.sendMail({
      from: `"Laxmi Motor Driving School" <${user}>`,
      replyTo: user,
      to: data.customerEmail,
      ...(bcc ? { bcc } : {}),
      subject,
      text: plainText,
      html: htmlContent,
    });

    console.log(`[New Booking Email Sent] MessageId: ${info.messageId} to ${data.customerEmail} (isPaid: ${isPaid})`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    console.error("[New Booking Email Error]", err);
    const errMessage = err instanceof Error ? err.message : "Failed to send booking confirmation email.";
    return { success: false, error: errMessage };
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
Government Approved Driving School · Rohtak, Haryana

Namaste ${customerName},

The status of your driving training booking has been updated.

CURRENT STATUS: ${newStatus}
Reference: #${shortId}
Vehicle: ${vehicleType}
${preferredDate ? `Date & Time: ${preferredDate} ${preferredTime}\n` : ""}${mobile ? `Mobile: ${mobile}\n` : ""}
If you have questions, please call us at +91 94160 55858.

Thank you,
Laxmi Motor Driving Training School
Near Old Bus Stand / Ground, Rohtak, Haryana
`;

  try {
    const info = await transporter.sendMail({
      from: `"Laxmi Motor Driving School" <${user}>`,
      replyTo: user,
      to: data.customerEmail,
      subject: `Booking Status Update: ${newStatus} [Ref: #${shortId}]`,
      text: plainText,
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Laxmi Motor Driving Training School</h2>
        <p>Namaste <strong>${customerName}</strong>,</p>
        <p>Your driving lesson booking status is now: <strong>${newStatus}</strong>.</p>
        <p>Booking Reference: <strong>#${shortId}</strong></p>
        <p>Helpline: +91 94160 55858 | Website: <a href="https://laxmidriving.com">laxmidriving.com</a></p>
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
