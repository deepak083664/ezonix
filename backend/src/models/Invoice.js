const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product reference is required'],
        },
        name: String, // Snapshot of product name at invoice creation
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price must be positive'],
        },
        taxPercent: {
          type: Number,
          default: 0,
        },
        discountPercent: {
          type: Number,
          default: 0,
        },
      },
    ],
    taxTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    amountDue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ invoiceNumber: 'text' });
invoiceSchema.index({ customer: 1, status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
