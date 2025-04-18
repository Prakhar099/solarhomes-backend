require("dotenv").config();
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
    pass: process.env.EMAIL_PASS,
  },
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
    suggestedCapacity,
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate PDF as a buffer
  const generatePDFBuffer = () => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc.fontSize(18).text("Solar Quote - Solar Homes India", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Name: ${fullName}`);
      doc.text(`Email: ${email}`);
      doc.text(`Phone: ${phone}`);
      doc.text(`Address: ${address}`);
      doc.text(`Monthly Bill: ₹${monthlyBill}`);
      doc.text(`Roof Type: ${roofType}`);
      doc.text(`System Type: ${systemType}`);
      doc.text(`Suggested Capacity: ${suggestedCapacity}`);
      doc.text(`Additional Info: ${additional}`);

      doc.end();
    });
  };

  try {
    const pdfBuffer = await generatePDFBuffer();

    const customerMailOptions = {
      from: `Solar Homes India <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Solar Quote – Solar Homes India",
      html: `
        <p>Hello ${fullName},</p>
        <p>Attached is your personalized solar quotation based on the information you provided.</p>
        <p>Regards,<br/>Solar Homes India</p>
      `,
      attachments: [
        {
          filename: "solar-quote.pdf",
          content: pdfBuffer,
        },
      ],
    };

    const internalMailOptions = {
      from: `Website Lead <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Lead from ${fullName}`,
      text: `Name: ${fullName}
Phone: ${phone}
Email: ${email}
Address: ${address}
Monthly Bill: ₹${monthlyBill}
Roof Type: ${roofType}
System Type: ${systemType}
Suggested Capacity: ${suggestedCapacity}
Notes: ${additional}`,
    };

    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(internalMailOptions);

    res.status(200).json({ message: "Quote sent with PDF successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send quote", error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
