// utils/email.js
"use strict";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or "hotmail", "yahoo", or SMTP
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password (NOT your actual email password)
  },
});

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `"Job Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw new Error("Email sending failed");
  }
}

module.exports = { sendEmail };
