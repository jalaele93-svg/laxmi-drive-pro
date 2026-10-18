import nodemailer from "nodemailer";

async function testPort465() {
  console.log("Testing Gmail SMTP on port 465 (secure: true)...");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "frameflicks00@gmail.com",
      pass: "rxed baqr gfib fjac",
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
  });

  try {
    const verified = await transporter.verify();
    console.log("Port 465 verify success:", verified);

    const info = await transporter.sendMail({
      from: '"Laxmi Driving School" <frameflicks00@gmail.com>',
      to: "frameflicks00@gmail.com",
      subject: "Test Port 465 SMTP Verification",
      text: "Port 465 direct SSL works perfectly!",
    });
    console.log("Port 465 send success! MessageId:", info.messageId);
  } catch (err) {
    console.error("Port 465 error:", err);
  }
}

testPort465();
