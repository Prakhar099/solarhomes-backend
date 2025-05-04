require('dotenv').config();
<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Invoice = require("../models/Invoice");
=======
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
>>>>>>> parent of 783cab7 (Corrected Version of Backend Code0)

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Quote email route (already present)
app.post("/api/send-savings-pdf", async (req, res) => {
  const {
    email,
    billAmount,
    roofArea,
    sunlightHours,
    monthly,
    yearly,
    twentyFiveYear,
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const mailOptions = {
        from: `Solar Homes India <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Solar Savings Report",
        html: `
          <div style="font-family:sans-serif;">
            <h3>Hello!</h3>
            <p>Find your solar savings report attached based on the values you entered.</p>
            <p>Thank you for choosing Solar Homes India.</p>
          </div>
        `,
        attachments: [
          {
            filename: `SolarSavings_Report_${new Date()
              .toISOString()
              .split("T")[0]}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent with PDF report" });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        res.status(500).json({ message: "Failed to send email", error: emailErr.message });
      }
    });

    // PDF content
    doc.fontSize(20).text("Solar Savings Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Monthly Electricity Bill: ₹${billAmount}`);
    doc.text(`Roof Area: ${roofArea} sq ft`);
    doc.text(`Sunlight Hours: ${sunlightHours} hrs/day`);
    doc.moveDown();
    doc.text(`Estimated Monthly Savings: ₹${monthly}`);
    doc.text(`Estimated Yearly Savings: ₹${yearly}`);
    doc.text(`Estimated 25-Year Savings: ₹${twentyFiveYear}`);
    doc.moveDown();
    doc.text("SolarHomes India | India's Trusted Solar Experts");
    doc.text("Contact: +91 8109586344 | info@solarhomesindia.com");
    doc.end();
  } catch (err) {
    console.error("PDF generation or email process failed:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Server start
const PORT = process.env.PORT || 10000;
<<<<<<< HEAD
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

=======
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
>>>>>>> parent of 783cab7 (Corrected Version of Backend Code0)
