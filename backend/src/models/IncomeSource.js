const mongoose = require('mongoose');

const incomeSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Income source name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#2563EB',
    },
  },
  {
    timestamps: true,
  }
);

incomeSourceSchema.index({ name: 'text' });

const IncomeSource = mongoose.model('IncomeSource', incomeSourceSchema);

module.exports = IncomeSource;
