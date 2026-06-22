const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Expense category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount must be positive'],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    receiptPublicId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ category: 'text', description: 'text' });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
