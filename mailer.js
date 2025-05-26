
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });



const sendEmailWithAttachment = async ({from, to, subject, text, html, attachments }) => {
  

  const info = await transporter.sendMail({
    from: `<${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments
  });

  console.log("Message sent:", info.messageId);
};



module.exports = sendEmailWithAttachment;