const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const invoiceRoutes = require('./routes/invoice');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', invoiceRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/solar-billing', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));