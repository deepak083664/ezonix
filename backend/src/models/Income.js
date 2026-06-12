const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    incomeSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncomeSource',
      required: [true, 'Income source reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Income amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    receivedThrough: {
      type: String,
      required: [true, 'Payment method/received through is required'],
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Card', 'Other'],
      default: 'Cash',
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ description: 'text', referenceNumber: 'text' });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
