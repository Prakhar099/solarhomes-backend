const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  rate: Number,
  amount: Number
});

const invoiceSchema = new mongoose.Schema({
  invoiceNo: String,
  clientName: String,
  clientEmail: String,
  amount: Number,
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  date: String,
  dueDate: String,
  items: [itemSchema],
  subtotal: Number,
  taxPercentage: Number,
  taxAmount: Number,
  discount: Number,
  total: Number,
  notes: String,
  paymentTerms: String,
  quotationRef: String
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
