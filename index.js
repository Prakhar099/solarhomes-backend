const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json());

// Set up Nodemailer with Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465, // Use 587 if 465 fails
  secure: true, // false if using port 587
  auth: {
    user: "enquiry@solarhomesindia.com", // Replace with your Hostinger email
    pass: "Solarindia@2026" // Replace with your actual email password
  }
});

app.post("/api/send-quote", async (req, res) => {
  const { name, phone, city, bill, email } = req.body;

  // Basic system size and pricing logic
  let systemSize = bill < 2500 ? '2kW' : bill < 5000 ? '3kW' : '5kW';
  let estimatedCost = systemSize === '2kW' ? '₹1,00,000' : systemSize === '3kW' ? '₹1,40,000' : '₹2,10,000';

  // Email to customer
  const customerMailOptions = {
    from: 'Solar Homes India <enquiry@solarhomesindia.com>',
    to: email,
    subject: 'Your Solar System Quote – Solar Homes India',
    html: `
      <div style="font-family:sans-serif;padding:20px;">
        <h2>Hi ${name},</h2>
        <p>Based on your electricity bill of ₹${bill}, we recommend a <strong>${systemSize}</strong> rooftop solar system.</p>
        <p><strong>Estimated Price:</strong> ${estimatedCost}</p>
        <p>This includes installation, net metering, subsidy support, and a 25-year performance warranty.</p>
        <br />
        <p>Our team will contact you shortly to guide you through the next steps.</p>
        <p>Warm regards,<br>Solar Homes India</p>
      </div>
    `
  };

  // Notification to company
  const internalMailOptions = {
    from: 'Website Lead <enquiry@solarhomesindia.com>',
    to: 'enquiry@solarhomesindia.com',
    subject: `New Quote Request from ${name}`,
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

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
