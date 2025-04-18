require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer(); // Handles multipart/form-data

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter using Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // e.g., enquiry@solarhomesindia.com
    pass: process.env.EMAIL_PASS  // app-specific SMTP password
  }
});

// Verify SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP configuration error ❌", err);
  } else {
    console.log("✅ SMTP server is ready to send emails.");
  }
});

/**
 * Route: POST /api/send-savings-pdf
 * Receives PDF blob and user's email, sends the PDF via email
 */
app.post('/api/send-savings-pdf', upload.single('pdf'), async (req, res) => {
  const email = req.body.email;
  const pdf = req.file;

  if (!email || !pdf) {
    return res.status(400).json({ error: "Missing email or PDF file." });
  }

  const mailOptions = {
    from: `Solar Homes India <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Solar Savings Report",
    html: `
      <div style="font-family:Arial,sans-serif;padding:10px;">
        <h2>Thank You for Using SolarHomes!</h2>
        <p>Please find your personalized solar savings report attached.</p>
        <p>Warm regards,<br>Team SolarHomes India</p>
      </div>
    `,
    attachments: [
      {
        filename: pdf.originalname || 'SolarSavings_Report.pdf',
        content: pdf.buffer,
        contentType: 'application/pdf',
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
