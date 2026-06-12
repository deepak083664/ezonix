const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'A key identifier is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Value content is required'],
    },
  },
  {
    timestamps: true,
  }
);

const WebsiteContent = mongoose.model('WebsiteContent', websiteContentSchema);

module.exports = WebsiteContent;
