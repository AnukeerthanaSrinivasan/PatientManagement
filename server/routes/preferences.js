const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Configuration ---
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use "App Password" for Gmail
  }
});

// --- API Endpoint ---
app.post('/api/preferences', async (req, res) => {
  const { whatsapp, email } = req.body;

  try {
    // 1. Send WhatsApp via Twilio
    if (whatsapp) {
      await twilioClient.messages.create({
        from: 'whatsapp:+14155238886', // Twilio Sandbox Number
        to: 'whatsapp:+91XXXXXXXXXX', // Your verified number
        body: 'Hello! Your notification preferences have been updated.'
      });
    }

    // 2. Send Email via Nodemailer
    if (email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'recipient@example.com',
        subject: 'Notification Update',
        text: 'You have successfully enabled email notifications.'
      });
    }

    res.status(200).send({ message: "Notifications sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending notifications");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));