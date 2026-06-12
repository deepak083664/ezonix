const WebsiteContent = require('../models/WebsiteContent');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getLandingPageContent = catchAsync(async (req, res, next) => {
  const contents = await WebsiteContent.find();
  
  // Package into a single dynamic object keys
  const config = {};
  contents.forEach((item) => {
    config[item.key] = item.value;
  });

  res.status(200).json({
    status: 'success',
    data: {
      content: config,
    },
  });
});

exports.updateSectionContent = catchAsync(async (req, res, next) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return next(new AppError('Content value is required to update section.', 400));
  }

  const updatedContent = await WebsiteContent.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      content: updatedContent,
    },
  });
});
