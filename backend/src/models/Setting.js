const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      default: 'My Business',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    logoPublicId: {
      type: String,
      default: '',
    },
    gstNumber: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
      trim: true,
      uppercase: true,
    },
    defaultTaxRate: {
      type: Number,
      default: 18, // 18% standard GST default
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
