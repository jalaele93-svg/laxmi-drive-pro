import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import { z } from "zod";

function getTransporter() {
  const host = process.env["NODEMAILER_HOST"] || "smtp.gmail.com";
  const port = Number(process.env["NODEMAILER_PORT"] || 587);
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

function getStatusBadgeConfig(status: string) {
  const s = status.toLowerCase();
  if (s.includes("confirm")) {
    return {
      bg: "#dcfce7",
      text: "#15803d",
      border: "#86efac",
      label: "Confirmed",
      message:
        "Great news! Your driving training booking has been confirmed. Our team will contact you shortly to assign your instructor and schedule your first lesson.",
    };
  }
  if (s.includes("progress")) {
    return {
      bg: "#dbeafe",
      text: "#1d4ed8",
      border: "#93c5fd",
      label: "In Progress",
      message:
        "Your driving training lessons are currently in progress. We hope you are learning with confidence and safe habits!",
    };
  }
  if (s.includes("complete")) {
    return {
      bg: "#f3e8ff",
      text: "#6b21a8",
      border: "#d8b4fe",
      label: "Completed",
      message:
        "Congratulations! You have completed your driving training with Laxmi Motor Driving Training School. Drive safe and carry road safety everywhere!",
    };
  }
  if (s.includes("cancel")) {
    return {
      bg: "#fee2e2",
      text: "#b91c1c",
      border: "#fca5a5",
      label: "Cancelled",
      message:
        "Your driving lesson booking has been marked as cancelled. If you believe this is an error or would like to reschedule, please contact us.",
    };
  }
  return {
    bg: "#fef3c7",
    text: "#b45309",
    border: "#fde68a",
    label: status,
    message: `Your driving lesson booking status has been updated to "${status}".`,
  };
}

// 1. Admin updates booking status
const sendBookingStatusSchema = z.object({
  bookingId: z.string().default("REF"),
  customerEmail: z.string().trim(),
  customerName: z.string().default("Learner"),
  newStatus: z.string().default("Confirmed"),
  vehicleType: z.string().nullish().default(""),
  preferredDate: z.string().nullish().default(""),
  preferredTime: z.string().nullish().default(""),
  mobile: z.string().nullish().default(""),
});

export const sendBookingStatusEmail = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendBookingStatusSchema.parse(data))
  .handler(async ({ data }) => {
    const { user, transporter } = getTransporter();
    const badge = getStatusBadgeConfig(data.newStatus);
    const shortId = data.bookingId.length > 8 ? data.bookingId.slice(0, 8).toUpperCase() : data.bookingId;

    const plainText = `
LAXMI MOTOR DRIVING TRAINING SCHOOL - BOOKING STATUS UPDATE
Government Approved Driving School · Rohtak, Haryana

Namaste ${data.customerName},

The status of your driving training booking has been updated.

CURRENT STATUS: ${badge.label}
${badge.message}

BOOKING DETAILS:
------------------------------------------
• Booking Reference: #${shortId}
${data.vehicleType ? `• Vehicle Training: ${data.vehicleType}\n` : ""}${data.preferredDate ? `• Scheduled Date: ${data.preferredDate} ${data.preferredTime || ""}\n` : ""}${data.mobile ? `• Contact Mobile: ${data.mobile}\n` : ""}
NEED HELP?
• Phone: +91 94160 55858
• WhatsApp: +91 94160 55858
• Website: https://laxmidriving.com

Thank you,
Laxmi Motor Driving Training School
`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Status Update</title>
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
                Namaste <strong>${data.customerName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
                The status of your driving training booking has been updated by our team.
              </p>

              <!-- Status Badge Card -->
              <div style="background-color: ${badge.bg}; border: 1.5px solid ${badge.border}; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                <span style="display: inline-block; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; color: ${badge.text}; margin-bottom: 6px;">
                  Current Booking Status
                </span>
                <div style="font-size: 22px; font-weight: 800; color: ${badge.text};">
                  ${badge.label}
                </div>
                <p style="margin: 8px 0 0; font-size: 14px; line-height: 1.5; color: ${badge.text};">
                  ${badge.message}
                </p>
              </div>

              <!-- Booking Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8fafc;">
                  <td colspan="2" style="padding: 12px 16px; font-weight: 700; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    Booking Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">
                    Booking Reference
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    #${shortId}
                  </td>
                </tr>
                ${
                  data.vehicleType
                    ? `<tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Vehicle Training
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${data.vehicleType}
                  </td>
                </tr>`
                    : ""
                }
                ${
                  data.preferredDate
                    ? `<tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Scheduled Date & Time
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    ${data.preferredDate} ${data.preferredTime ? `at ${data.preferredTime}` : ""}
                  </td>
                </tr>`
                    : ""
                }
              </table>

              <!-- Help Box -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-weight: 700; font-size: 14px; color: #0f172a;">
                  Questions or Need to Reschedule?
                </p>
                <p style="margin: 0 0 12px; font-size: 13px; color: #64748b; line-height: 1.5;">
                  Our support team is happy to assist you anytime via Phone or WhatsApp.
                </p>
                <div>
                  <a href="tel:+919861704224" style="display: inline-block; background-color: #1E40E7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 6px; margin-right: 8px;">
                    Call: +91 98617 04224
                  </a>
                  <a href="https://wa.me/919861704224" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 6px;">
                    WhatsApp Us
                  </a>
                </div>
              </div>

              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Thank you for choosing Laxmi Motor Driving Training School. We are dedicated to making you a confident and safe driver.
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

    try {
      const info = await transporter.sendMail({
        from: `"Laxmi Motor Driving School" <${user}>`,
        replyTo: user,
        to: data.customerEmail,
        subject: `Booking Update: Your training booking is ${badge.label} | Laxmi Driving School`,
        text: plainText,
        html: htmlContent,
      });

      console.log(`[Status Email Sent] MessageId: ${info.messageId} to ${data.customerEmail}`);
      return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
      console.error("[Status Email Send Error]", err);
      const message = err instanceof Error ? err.message : "Failed to send email notification.";
      return { success: false, error: message };
    }
  });

// 2. Customer completes a new booking on /book
const newBookingConfirmationSchema = z.object({
  bookingRef: z.string().default("REF"),
  customerName: z.string().default("Learner"),
  customerEmail: z.string().trim().optional().default(""),
  mobile: z.string().default(""),
  vehicleType: z.string().default("Training"),
  experience: z.string().default("Beginner"),
  date: z.string().default(""),
  time: z.string().default(""),
  message: z.string().default(""),
  paymentChoice: z.string().default("Decide after confirmation call"),
  paymentStatus: z.string().optional(),
  paymentId: z.string().optional(),
  amountPaid: z.number().optional(),
});

export const sendNewBookingConfirmationEmail = createServerFn({ method: "POST" })
  .validator((data: unknown) => newBookingConfirmationSchema.parse(data))
  .handler(async ({ data }) => {
    const { sendBookingConfirmationEmailDirect } = await import("./booking-email.server");
    return await sendBookingConfirmationEmailDirect(data);
  });
