import nodemailer from "nodemailer";

const host = process.env.NODEMAILER_HOST || "smtp.gmail.com";
const port = Number(process.env.NODEMAILER_PORT || 587);
const user = process.env.NODEMAILER_EMAIL || "frameflicks00@gmail.com";
const pass = process.env.NODEMAILER_PASSWORD || "rxed baqr gfib fjac";

console.log("Testing Nodemailer with credentials:");
console.log({ host, port, user, passLength: pass.length });

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    console.log("Verifying connection to SMTP server...");
    await transporter.verify();
    console.log("Transporter verification SUCCESS!");

    console.log("Sending test email to frameflicks00@gmail.com...");
    const info = await transporter.sendMail({
      from: `"Laxmi Driving School" <${user}>`,
      to: user,
      subject: "Test Booking Email from Laxmi Driving School",
      text: "This is a test email to verify that Nodemailer is working properly.",
    });
    console.log("Email sent successfully! MessageId:", info.messageId);
  } catch (err) {
    console.error("Transporter Error:", err);
  }
}

main();
