const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const path = require('path');
const fs = require('fs');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ reqBody }) {
    const tempPath = path.join(__dirname, 'qr-files');
    const filePath = path.join(tempPath, `${reqBody.timestamp}.png`);

    // Read and encode the image file as base64
    let attachment;

    fs.readFile(filePath, async (err, fileBuffer) => {

        if (err) {
            throw err;
        }


        try {
            const base64Image = fileBuffer.toString('base64');

            attachment = {
                content: base64Image,
                filename: `${reqBody.timestamp}.png`,
                type: 'image/png',
                disposition: 'inline',
                content_id: 'qrimage'
            };


            const htmlBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>German Forum 2025 Registration</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
      }
      .header {
        background-color: #D9B144;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        padding: 20px;
        color: #333333;
        line-height: 1.6;
        font-size: 16px;
      }
      .qr-container {
        text-align: center;
        margin: 30px 0;
      }
      .footer {
        font-size: 13px;
        color: #777777;
        text-align: center;
        padding: 20px;
        border-top: 1px solid #dddddd;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        German Forum 2025 – Registration Confirmed
      </div>
      <div class="content">
        <p>Dear Participant,</p>
        <p>
          Thank you for registering for the <strong>German Forum 2025</strong>.
          We appreciate your interest and look forward to your participation.
        </p>
        <p><strong>Date:</strong> 17th June 2025</p>
        <p><strong>Time:</strong> 7 PM (Gates open at 6:30 PM)</p>
        <p><strong>Location:</strong> Solar Ballroom, One & Only Zabeel</p>

        <div class="qr-container">
          <p><strong>Please present this QR code at the entrance:</strong></p>
          <img src="cid:qrimage" alt="QR Code" width="200" height="200" />
        </div>

        <p>
          If you have any questions, feel free to contact us at
          <a href="mailto:info@german-emirates-club.com">info@german-emirates-club.com</a>.
        </p>

        <p>Warm regards,<br />The German Emirates Club Team</p>
      </div>
      <div class="footer">
        &copy; 2025 German Emirates Club. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;




            const msg = {
                to: reqBody.email,
                from: "development2@german-emirates-club.com",
                subject: "Participant Registration – German Forum 2025",
                html: htmlBody,
                attachments: [attachment]
            };

            const response = await sgMail.send(msg);
            return response;
        } catch (error) {
            throw error;
        }

    })
}

module.exports = { sendEmail };