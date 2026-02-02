import nodemailer from "nodemailer";

export async function sendOtpEmail(otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"QMIS Dashboard" <${process.env.SMTP_USER}>`,
    to: process.env.OTP_RECEIVER_EMAIL,
    subject: "Login OTP",
    text: `OTP: ${otp}\nValid for 5 minutes`,
  });
}
