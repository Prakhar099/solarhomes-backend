require('dotenv').config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { jsPDF } = require("jspdf");
const { Buffer } = require("buffer");

const app = express();
app.use(cors());
app.use(express.json());

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP connection failed:", err);
  } else {
    console.log("SMTP server is ready to send emails ✅");
  }
});

// API route to send quote email with optional PDF
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

  // Create PDF quotation
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Your Solar Quotation", 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${fullName}`, 20, 40);
  doc.text(`Phone: ${phone}`, 20, 50);
  doc.text(`Email: ${email}`, 20, 60);
  doc.text(`Monthly Bill: ₹${monthlyBill}`, 20, 70);
  doc.text(`Roof Type: ${roofType}`, 20, 80);
  doc.text(`System Type: ${systemType}`, 20, 90);
  doc.text(`Suggested Capacity: ${suggestedCapacity}`, 20, 100);
  doc.text(`Additional Info: ${additional}`, 20, 110);
  const pdfBuffer = doc.output("arraybuffer");

  const customerMailOptions = {
    from: `Solar Homes India <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: email,
    subject: "Your Solar Quote – Solar Homes India",
    text: `Hello ${fullName},\n\nThanks for your interest in a ${systemType} rooftop solar system.\nEstimated Monthly Bill: ₹${monthlyBill}\nSuggested Capacity: ${suggestedCapacity}\nRoof Type: ${roofType}\nAdditional Info: ${additional}\n\nWe will contact you shortly.\n\n- Solar Homes India`,
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
    `,
    attachments: [
      {
        filename: "Your_Solar_Quote.pdf",
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf"
      }
    ]
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
    console.log("Sending quote to customer:", email);
    const customerResult = await transporter.sendMail(customerMailOptions);
    console.log("✅ Customer email sent:", customerResult.response);

    const internalResult = await transporter.sendMail(internalMailOptions);
    console.log("✅ Internal lead email sent:", internalResult.response);

    res.status(200).json({ message: "Quote sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Failed to send quote", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Solar Homes API is running.");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

