// Load environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter using Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465, // Use 587 if 465 fails
  secure: true, // Use false if using port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Optional: verify SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP connection failed:", err);
  } else {
    console.log("SMTP server is ready to send emails ✅");
  }
});

// Route: Send solar quote
app.post("/api/send-quote", async (req, res) => {
  const { name, phone, city, bill, email } = req.body;

  // Simple system suggestion logic
  let systemSize = bill < 2500 ? '2kW' : bill < 5000 ? '3kW' : '5kW';
  let estimatedCost = systemSize === '2kW' ? '₹1,00,000' : systemSize === '3kW' ? '₹1,40,000' : '₹2,10,000';

  // Email to customer
  const customerMailOptions = {
    from: `Solar Homes India <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Solar Quote – Solar Homes India",
    html: `
      <div style="font-family:sans-serif; padding:20px;">
        <h2>Hello ${name},</h2>
        <p>Based on your monthly electricity bill of ₹${bill}, we recommend a <strong>${systemSize}</strong> solar system.</p>
        <p><strong>Estimated Cost:</strong> ${estimatedCost}</p>
        <p>This includes installation, net metering, and 25-year warranty.</p>
        <p>We'll get in touch with you soon!</p>
        <br/>
        <p>Regards,<br/>Team Solar Homes India</p>
      </div>
    `
  };

  // Internal notification email
  const internalMailOptions = {
    from: `Website Lead <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Lead from ${name}`,
    text: `Name: ${name}\nPhone: ${phone}\nCity: ${city}\nBill: ₹${bill}\nEmail: ${email}`
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(internalMailOptions);
    res.status(200).json({ message: "Quote sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send quote" });
  }
});

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

