const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Purchase amount is required'],
      min: [0, 'Amount must be positive'],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    invoiceNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ supplierName: 'text', invoiceNumber: 'text' });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
