require('dotenv').config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
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

  if (!email) return res.status(400).json({ message: "Missing email" });

  const customerMailOptions = {
    from: `Solar Homes India <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: email,
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
    res.status(500).json({ message: "Failed to send quote", error: error.message });
  }
});

app.post("/api/send-savings-pdf", async (req, res) => {
  const { email, billAmount, roofArea, sunlightHours, monthly, yearly, twentyFiveYear } = req.body;

  if (!email) return res.status(400).json({ message: "Missing email address" });

  const doc = new PDFDocument();
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    const pdfData = Buffer.concat(buffers);

    const mailOptions = {
      from: `Solar Homes India <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Solar Savings Report",
      html: `
        <div style="font-family:sans-serif;">
          <h3>Hello!</h3>
          <p>Find your solar savings report attached based on the values you entered.</p>
        </div>
      `,
      attachments: [
        {
          filename: "SolarSavings_Report.pdf",
          content: pdfData,
          contentType: "application/pdf"
        }
      ]
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "PDF report sent successfully" });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ message: "Failed to send email", error: err.message });
    }
  });

  doc.fontSize(20).text("Solar Savings Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Electricity Bill: ₹${billAmount}`);
  doc.text(`Roof Area: ${roofArea} sq ft`);
  doc.text(`Sunlight Hours: ${sunlightHours} hrs/day`);
  doc.moveDown();
  doc.text(`Estimated Monthly Savings: ₹${monthly}`);
  doc.text(`Estimated Yearly Savings: ₹${yearly}`);
  doc.text(`Estimated 25-Year Savings: ₹${twentyFiveYear}`);
  doc.end();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

