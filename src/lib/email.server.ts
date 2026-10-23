import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
        "Congratulations! You have completed your driving training with Laxmi Driving Training School. Drive safe and carry road safety everywhere!",
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
    const badge = getStatusBadgeConfig(data.newStatus);
    const shortId = data.bookingId.length > 8 ? data.bookingId.slice(0, 8).toUpperCase() : data.bookingId;

    const plainText = `
Laxmi Driving TRAINING SCHOOL - BOOKING STATUS UPDATE
Plot No.-101, Palaspur, Main Road, PS.-Pattapur, Distt.-Ganjam, Odisha - 761013

Namaste ${data.customerName},

The status of your driving training booking has been updated.

CURRENT STATUS: ${badge.label}
${badge.message}

BOOKING DETAILS:
------------------------------------------
• Booking Reference: #${shortId}
${data.vehicleType ? `• Vehicle Training: ${data.vehicleType}\n` : ""}${data.preferredDate ? `• Scheduled Date: ${data.preferredDate} ${data.preferredTime || ""}\n` : ""}${data.mobile ? `• Contact Mobile: ${data.mobile}\n` : ""}
NEED HELP?
• Phone: +91 98617 04224
• WhatsApp: +91 98617 04224
• Website: https://laxmidriving.com

Thank you,
Laxmi Driving Training School
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
                Laxmi Driving Training School
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
                ${data.vehicleType
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
                ${data.preferredDate
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
                Thank you for choosing Laxmi Driving Training School. We are dedicated to making you a confident and safe driver.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 600;">
                Laxmi Driving Training School
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

    const { sendEmailCore } = await import("./booking-email.server");
    return await sendEmailCore({
      senderName: "Laxmi Driving School",
      to: data.customerEmail,
      replyTo: "inofdriving@gmail.com",
      subject: `Booking Update: Your training booking is ${badge.label} | Laxmi Driving School`,
      text: plainText,
      html: htmlContent,
    });
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

// 3. Partner application submitted on /partner-apply (Step 5 complete)
export type PartnerApplicationAlertData = {
  applicationNo: string;
  fullName: string;
  mobile: string;
  email?: string;
  alternateMobile?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  vehicleType: string;
  registrationNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  manufacturingYear?: number | string;
  fuelType?: string;
  transmission?: string;
  vehicleColor?: string;
  ownershipStatus?: string;
  preferredLocation?: string;
  preferredUse?: string;
  preferredAvailability?: string;
  bankAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  upiId?: string;
  depositAmount?: number;
  paymentReference?: string;
  paymentStatus?: string;
};

const ADMIN_NOTIFICATION_EMAILS = [
  "inofdriving@gmail.com",
  "frameflicks00@gmail.com",
  "kunalbabber36@gmail.com",
];

export async function sendPartnerApplicationAlertEmailDirect(data: PartnerApplicationAlertData) {
  const { sendEmailCore } = await import("./booking-email.server");

  const appNo = data.applicationNo || "APP";
  const fullName = data.fullName?.trim() || "Applicant";
  const mobile = data.mobile?.trim() || "";
  const rawEmail = data.email?.trim().toLowerCase() || "";
  const hasValidCustomerEmail = Boolean(
    rawEmail &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail) &&
    !rawEmail.endsWith("@partner.laxmidriving.com"),
  );
  const vehicle = `${data.vehicleType || "Vehicle"} · ${data.vehicleMake || ""} ${data.vehicleModel || ""}`.trim();
  const regNo = data.registrationNumber || "Not provided";
  const deposit = data.depositAmount || 2000;
  const paymentRef = data.paymentReference?.trim() || "";
  const isPaidOrRef = Boolean(paymentRef);

  let adminSent = false;
  let applicantSent = false;

  // 1. Send alert to Admin
  try {
    const adminSubject = isPaidOrRef
      ? `🚗💰 [Payment Ref: ${paymentRef}] New Partner App: ${fullName} (${mobile}) - ${vehicle} [#${appNo}]`
      : `🚗 [New Partner App] ${fullName} (${mobile}) - ${vehicle} [#${appNo}]`;

    const adminText = `
Laxmi Driving TRAINING SCHOOL - NEW VEHICLE PARTNER APPLICATION
Application ID: #${appNo}

APPLICANT DETAILS:
• Name: ${fullName}
• Mobile: ${mobile}
• Alternate Mobile: ${data.alternateMobile || "None"}
• Email: ${rawEmail || "None"}
• Address: ${data.address || ""}, ${data.city || ""}, ${data.district || ""}, ${data.state || ""} - ${data.pincode || ""}

VEHICLE DETAILS:
• Type: ${data.vehicleType}
• Registration No: ${regNo}
• Make & Model: ${data.vehicleMake} ${data.vehicleModel} (${data.manufacturingYear || ""})
• Fuel & Transmission: ${data.fuelType || ""} / ${data.transmission || ""}
• Ownership: ${data.ownershipStatus || "Individual"}
• Preferences: ${data.preferredLocation || ""} | ${data.preferredUse || ""} | ${data.preferredAvailability || ""}

BANK & PAYMENT DETAILS:
• Account Holder: ${data.bankAccountName || "Not provided"}
• Bank: ${data.bankName || "Not provided"}
• Account No: ${data.bankAccountNumber || "Not provided"}
• IFSC: ${data.bankIfsc || "Not provided"}
• UPI ID: ${data.upiId || "Not provided"}
• Advance Deposit: ₹${deposit.toLocaleString("en-IN")}
• Payment Reference: ${paymentRef || "Pending Payment"}
• Payment Status: ${data.paymentStatus || (isPaidOrRef ? "Under Verification" : "Pending")}

Review and approve/decline in Admin Portal:
https://laxmidriving.com/admin/partners
`;

    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Partner Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 28px 24px; text-align: center;">
              <span style="display: inline-block; background: #e0e7ff; color: #1e3a8a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
                Vehicle Partner Program
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                New Partner Application Received
              </h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
                Application ID: <strong>#${appNo}</strong> · Laxmi Driving Training
              </p>
            </td>
          </tr>

          ${isPaidOrRef
        ? `<tr>
            <td style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 12px 24px;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #065f46;">
                ✓ Advance Deposit Reference Provided: <span style="font-family: monospace; font-size: 14px; color: #047857;">${paymentRef}</span> (Under Verification)
              </p>
            </td>
          </tr>`
        : `<tr>
            <td style="background-color: #fffbeb; border-bottom: 1px solid #fde68a; padding: 12px 24px;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #92400e;">
                ⏳ Payment Pending — Partner submitted without payment reference.
              </p>
            </td>
          </tr>`
      }

          <tr>
            <td style="padding: 24px;">
              <!-- Section: Applicant Details -->
              <h2 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">
                1. Applicant Information
              </h2>
              <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; width: 35%; border-bottom: 1px solid #e2e8f0;">Full Name</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Mobile Number</td>
                  <td style="padding: 8px 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    <a href="tel:${mobile}" style="color: #2563eb; text-decoration: none;">${mobile}</a>
                    ${data.alternateMobile ? ` (Alt: ${data.alternateMobile})` : ""}
                  </td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email</td>
                  <td style="padding: 8px 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${rawEmail || "None"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b;">Address</td>
                  <td style="padding: 8px 12px; color: #0f172a;">${data.address || ""}, ${data.city || ""}, ${data.district || ""}, ${data.state || ""} - ${data.pincode || ""}</td>
                </tr>
              </table>

              <!-- Section: Vehicle Details -->
              <h2 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">
                2. Vehicle Details
              </h2>
              <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; width: 35%; border-bottom: 1px solid #e2e8f0;">Vehicle</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.vehicleType} - ${data.vehicleMake} ${data.vehicleModel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Registration No</td>
                  <td style="padding: 8px 12px; font-weight: 800; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 14px;">${regNo}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Year / Fuel / Trans</td>
                  <td style="padding: 8px 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.manufacturingYear || ""} · ${data.fuelType || ""} · ${data.transmission || ""}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b;">Ownership & Pref</td>
                  <td style="padding: 8px 12px; color: #0f172a;">${data.ownershipStatus || "Individual"} · ${data.preferredLocation || ""} (${data.preferredUse || ""})</td>
                </tr>
              </table>

              <!-- Section: Bank & Payment Details -->
              <h2 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">
                3. Bank & Payment Information
              </h2>
              <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; width: 35%; border-bottom: 1px solid #e2e8f0;">Account Holder</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.bankAccountName || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Bank Name</td>
                  <td style="padding: 8px 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.bankName || "Not provided"}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Account Number</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${data.bankAccountNumber || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">IFSC Code</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${data.bankIfsc || "Not provided"}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 8px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">UPI ID</td>
                  <td style="padding: 8px 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.upiId || "None"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b;">Advance Deposit</td>
                  <td style="padding: 8px 12px; font-weight: 800; color: #059669;">₹${deposit.toLocaleString("en-IN")} (${data.paymentStatus || (isPaidOrRef ? "Under Verification" : "Pending")})</td>
                </tr>
              </table>

              <!-- Admin Action CTA -->
              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="https://laxmidriving.com/admin/partners" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 8px rgba(37,99,235,0.35);">
                  Review & Approve / Decline Application →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Laxmi Driving Training School · Plot No.-101, Palaspur, Main Road, PS.-Pattapur, Distt.-Ganjam, Odisha - 761013
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

    const adminRes = await sendEmailCore({
      senderName: "Laxmi Partner Program",
      to: ADMIN_NOTIFICATION_EMAILS,
      replyTo: hasValidCustomerEmail ? rawEmail : "inofdriving@gmail.com",
      subject: adminSubject,
      text: adminText,
      html: adminHtml,
    });
    adminSent = adminRes.success;
  } catch (e) {
    console.error("[sendPartnerApplicationAlertEmailDirect - Admin]", e);
  }

  // 2. Send confirmation to Applicant if valid email
  if (hasValidCustomerEmail) {
    try {
      const applicantSubject = `🚗 Application Received: Vehicle Partner Program [#${appNo}] | Laxmi Driving Training`;
      const applicantText = `
Namaste ${fullName},

Thank you for applying to enroll your vehicle (${data.vehicleMake} ${data.vehicleModel} - ${regNo}) with Laxmi Driving Training!

APPLICATION DETAILS:
• Application ID: #${appNo}
• Vehicle: ${data.vehicleType} - ${data.vehicleMake} ${data.vehicleModel}
• Registration Number: ${regNo}
• Preferred Location: ${data.preferredLocation || "Odisha"}
• Advance Deposit: ₹${deposit.toLocaleString("en-IN")}
• Payment Reference: ${paymentRef || "Pending Payment"}

WHAT HAPPENS NEXT:
1. Document Verification: Our verification team is reviewing your RC, Insurance, PUC and Driving Licence.
2. Vehicle Inspection: Our authorized representative will contact you to inspect the vehicle condition.
3. Partner Onboarding & Partner ID: Once verified and approved, you will receive your Partner ID and training assignments.

Track your application anytime on your Partner Dashboard:
https://laxmidriving.com/partner-dashboard

Need assistance?
• Phone / WhatsApp: +91 98617 04224
• Email: inofdriving@gmail.com

Thank you,
Laxmi Driving Training School
`;

      const applicantHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Partner Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #172554 100%); padding: 30px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                Application Received!
              </h1>
              <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px;">
                Vehicle Partner Program · Laxmi Driving Training
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 15px; margin: 0 0 16px; color: #334155;">
                Namaste <strong>${fullName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; color: #475569;">
                Thank you for applying to enroll your vehicle with Laxmi Driving Training. Your application has been successfully received and assigned Application ID: <strong style="color: #1e40af;">#${appNo}</strong>.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
                  Application Summary
                </h3>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Vehicle:</strong> ${data.vehicleType} - ${data.vehicleMake} ${data.vehicleModel}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Reg Number:</strong> <span style="font-family: monospace; font-weight: 700;">${regNo}</span></p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Preferred Location:</strong> ${data.preferredLocation || "Odisha"}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Advance Deposit:</strong> ₹${deposit.toLocaleString("en-IN")}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>Payment Reference:</strong> ${paymentRef || "Pending Verification"}</p>
              </div>

              <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #0f172a;">
                What Happens Next?
              </h3>
              <ol style="margin: 0 0 20px; padding-left: 20px; font-size: 13px; line-height: 1.7; color: #475569;">
                <li><strong>Document Verification:</strong> Our team will review your uploaded RC, Insurance, PUC and Driving Licence.</li>
                <li><strong>Vehicle Inspection:</strong> Our authorized trainer will conduct an in-person physical inspection of your vehicle.</li>
                <li><strong>Final Approval:</strong> Once approved, your Partner ID will be generated and you will start receiving learner assignments.</li>
              </ol>

              <div style="text-align: center; margin: 24px 0;">
                <a href="https://laxmidriving.com/partner-dashboard" style="display: inline-block; background: #1e40af; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 6px;">
                  Track Application on Partner Dashboard →
                </a>
              </div>

              <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                Need help? Call or WhatsApp us at <a href="tel:+919861704224" style="color: #1e40af; font-weight: 600;">+91 98617 04224</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Laxmi Driving Training School · Government Approved Driving School
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

      const applicantRes = await sendEmailCore({
        senderName: "Laxmi Partner Program",
        to: rawEmail,
        replyTo: "inofdriving@gmail.com",
        subject: applicantSubject,
        text: applicantText,
        html: applicantHtml,
      });
      applicantSent = applicantRes.success;
    } catch (e) {
      console.error("[sendPartnerApplicationAlertEmailDirect - Applicant]", e);
    }
  }

  return { adminSent, applicantSent };
}

// 4. Partner status updated by Admin (Approved / Rejected / Correction Required)
const partnerStatusNotificationSchema = z.object({
  partnerEmail: z.string().trim().email(),
  partnerName: z.string().default("Partner"),
  applicationNo: z.string().default("APP"),
  newStatus: z.string(),
  partnerId: z.string().optional(),
  vehicleDetails: z.string().optional(),
  reason: z.string().optional(),
});

export type PartnerStatusNotificationPayload = z.infer<typeof partnerStatusNotificationSchema>;

export async function sendPartnerStatusNotificationEmailDirect(data: PartnerStatusNotificationPayload) {
  const { sendEmailCore } = await import("./booking-email.server");

  const isApproved = data.newStatus === "Approved" || data.newStatus === "Active";
  const isRejected = data.newStatus === "Rejected";
  const isCorrection = data.newStatus === "Correction Required";

  let subject = `Update on your Partner Application #${data.applicationNo} | Laxmi Driving Training`;
  if (isApproved) {
    subject = `🎉 Congratulations! Partner Application #${data.applicationNo} Approved [Partner ID: ${data.partnerId || ""}]`;
  } else if (isRejected) {
    subject = `Update on your Partner Application #${data.applicationNo} - Laxmi Driving Training`;
  } else if (isCorrection) {
    subject = `Action Needed: Corrections required for Partner Application #${data.applicationNo}`;
  }

  const badgeColor = isApproved ? "#15803d" : isRejected ? "#b91c1c" : "#b45309";
  const badgeBg = isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7";
  const badgeBorder = isApproved ? "#86efac" : isRejected ? "#fca5a5" : "#fde68a";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Partner Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #172554 100%); padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                Vehicle Partner Program
              </h1>
              <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px;">
                Application Status Update · #${data.applicationNo}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 15px; margin: 0 0 16px; color: #334155;">
                Namaste <strong>${data.partnerName}</strong>,
              </p>

              <!-- Status Badge -->
              <div style="background-color: ${badgeBg}; border: 1.5px solid ${badgeBorder}; border-radius: 10px; padding: 16px; margin-bottom: 20px; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${badgeColor}; display: block; margin-bottom: 4px;">
                  Current Application Status
                </span>
                <span style="font-size: 20px; font-weight: 800; color: ${badgeColor};">
                  ${data.newStatus}
                </span>
                ${data.partnerId
      ? `<p style="margin: 6px 0 0; font-size: 14px; font-weight: 700; color: #1e40af;">Official Partner ID: ${data.partnerId}</p>`
      : ""
    }
              </div>

              ${data.reason
      ? `<div style="background-color: #f8fafc; border-left: 4px solid ${badgeColor}; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #334155;">
                <strong>Staff Note / Reason:</strong>
                <p style="margin: 6px 0 0; color: #475569;">${data.reason}</p>
              </div>`
      : ""
    }

              ${isApproved
      ? `<p style="font-size: 14px; line-height: 1.6; color: #334155;">
                We are pleased to welcome you as an authorized Vehicle Partner with Laxmi Driving Training! Your vehicle and documents have been verified and approved. Our operations coordinator will contact you to schedule upcoming training assignments.
              </p>`
      : isCorrection
        ? `<p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Please log into your Partner Dashboard to review the required corrections and re-upload the requested documents so we can complete your verification.
              </p>`
        : `<p style="font-size: 14px; line-height: 1.6; color: #334155;">
                If you have questions regarding this decision or wish to submit an appeal, please contact our support desk.
              </p>`
    }

              <div style="text-align: center; margin: 24px 0;">
                <a href="https://laxmidriving.com/partner-dashboard" style="display: inline-block; background: #1e40af; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 6px;">
                  Open Partner Dashboard →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Laxmi Driving Training School · +91 98617 04224 · inofdriving@gmail.com
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

  return await sendEmailCore({
    senderName: "Laxmi Partner Program",
    to: data.partnerEmail,
    replyTo: "inofdriving@gmail.com",
    subject,
    text: `${subject}\n\nStatus: ${data.newStatus}\n${data.reason ? `Note: ${data.reason}\n` : ""}\nView at https://laxmidriving.com/partner-dashboard`,
    html,
  });
}

export const sendPartnerStatusNotificationEmail = createServerFn({ method: "POST" })
  .validator((data: unknown) => partnerStatusNotificationSchema.parse(data))
  .handler(async ({ data }) => {
    return await sendPartnerStatusNotificationEmailDirect(data);
  });

export const partnerWelcomeSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().default("Partner Applicant"),
  mobile: z.string().default(""),
});

export type PartnerWelcomeData = z.infer<typeof partnerWelcomeSchema>;

export async function sendPartnerWelcomeEmailDirect(data: PartnerWelcomeData) {
  const { sendEmailCore } = await import("./booking-email.server");

  const recipient = data.email.trim();
  if (!recipient || recipient.endsWith("@partner.laxmidriving.com")) {
    return { success: false, error: "No external email address provided." };
  }

  const name = data.fullName.trim() || "Vehicle Partner";
  const mobile = data.mobile.trim();
  const subject = `🚗 Welcome to Laxmi Driving Training - Partner Account Activated!`;

  const text = `
Hello ${name},

Welcome to Laxmi Driving Training School Vehicle Partner Network!

Your partner account has been created and activated successfully.
${mobile ? `• Registered Mobile: ${mobile}\n` : ""}• Registered Email: ${recipient}

You can now log in to complete your vehicle onboarding, upload documents (RC, Insurance, PUC, Driving Licence), and track your payout earnings at:
https://laxmidriving.com/partner-apply

If you ever need assistance, our support team is available at:
Phone / WhatsApp: +91 98617 04224
Email: inofdriving@gmail.com

Safe driving,
Laxmi Driving Training School
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Partner Account Activated</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 28px 24px; text-align: center;">
              <span style="display: inline-block; background: #e0e7ff; color: #1e3a8a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
                Vehicle Partner Network
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                Partner Account Activated!
              </h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
                Laxmi Driving Training School
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 12px 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #065f46;">
                ✓ Your account is active and ready to use
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #1e293b;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
                Welcome to the <strong>Laxmi Driving Training</strong> Partner Program! Your account has been registered and activated. You can sign in anytime using your <strong>10-digit mobile number</strong> or email.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">
                  Your Partner Credentials
                </h3>
                <table role="presentation" width="100%" style="font-size: 13px; line-height: 1.8;">
                  ${mobile ? `<tr><td style="color: #64748b; width: 40%;">Mobile Number:</td><td style="font-weight: 700; color: #0f172a;">${mobile}</td></tr>` : ""}
                  <tr><td style="color: #64748b;">Registered Email:</td><td style="font-weight: 700; color: #0f172a;">${recipient}</td></tr>
                  <tr><td style="color: #64748b;">Sign-in Method:</td><td style="color: #0f172a;">10-digit Mobile + your 4-6 digit PIN</td></tr>
                </table>
              </div>

              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="https://laxmidriving.com/partner-apply" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 8px rgba(37,99,235,0.3);">
                  Continue Partner Application →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Need help? Call or WhatsApp us at <strong>+91 98617 04224</strong> · <a href="mailto:inofdriving@gmail.com" style="color: #2563eb; text-decoration: none;">inofdriving@gmail.com</a>
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

  return await sendEmailCore({
    senderName: "Laxmi Partner Network",
    to: recipient,
    replyTo: "inofdriving@gmail.com",
    subject,
    text,
    html,
  });
}

export const sendPartnerWelcomeEmail = createServerFn({ method: "POST" })
  .validator((data: unknown) => partnerWelcomeSchema.parse(data))
  .handler(async ({ data }) => {
    return await sendPartnerWelcomeEmailDirect(data);
  });

