const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

router.post("/invoices", async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json({ message: "Invoice created", invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
