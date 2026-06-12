const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
