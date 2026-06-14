const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subscription must belong to a user'],
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Subscription must reference a plan'],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      default: 'paid',
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ userId: 1, status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
