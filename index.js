// Solar Homes Backend - Full Code (Matching Frontend Form)
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP connection failed:", err);
  } else {
    console.log("SMTP server is ready to send emails ✅");
  }
});

app.post("/api/send-quote", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    address,
    monthlyBill,
    roofType,
    systemType,
    additional,
    suggestedCapacity
  } = req.body;

  const customerMailOptions = {
    from: `Solar Homes India <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Solar Quote – Solar Homes India",
    html: `
      <div style="font-family:sans-serif; padding:20px;">
        <h2>Hello ${fullName},</h2>
        <p>Thanks for your interest in a <strong>${systemType}</strong> rooftop solar system.</p>
        <p><strong>Estimated Monthly Bill:</strong> ₹${monthlyBill}</p>
        <p><strong>Suggested System Capacity:</strong> ${suggestedCapacity}</p>
        <p><strong>Roof Type:</strong> ${roofType}</p>
        <p><strong>Additional Info:</strong> ${additional}</p>
        <p>Our team will contact you shortly with a detailed quotation.</p>
        <br/>
        <p>Regards,<br/>Solar Homes India</p>
      </div>
    `
  };

  const internalMailOptions = {
    from: `Website Lead <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Lead from ${fullName}`,
    text: `Name: ${fullName}
  Phone: ${phone}
  City: ${address}
  Bill: ₹${monthlyBill}
  Email: ${email}
  Roof Type: ${roofType}
  System Type: ${systemType}
  Suggested Capacity: ${suggestedCapacity}
  Notes: ${additional}`
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
