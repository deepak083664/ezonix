const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A plan must have a name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'A plan must have a description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A plan must have a price'],
      min: [0, 'Price cannot be negative'],
    },
    billingCycle: {
      type: String,
      required: [true, 'A plan must have a billing cycle'],
      enum: ['monthly', 'yearly', 'lifetime'],
      default: 'monthly',
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
