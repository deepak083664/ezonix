const Setting = require('../models/Setting');
const { deleteFile } = require('../middleware/uploadMiddleware');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getSettings = catchAsync(async (req, res, next) => {
  let setting = await Setting.findOne();

  // If no settings exist yet, create a default one
  if (!setting) {
    setting = await Setting.create({
      businessName: 'ezoinx',
      invoicePrefix: 'INV',
      defaultTaxRate: 18,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      setting,
    },
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  let setting = await Setting.findOne();

  if (!setting) {
    setting = await Setting.create({
      businessName: 'ezoinx',
      invoicePrefix: 'INV',
      defaultTaxRate: 18,
    });
  }

  const updateData = { ...req.body };

  if (req.file) {
    // Delete old logo
    if (setting.logoUrl) {
      await deleteFile(setting.logoUrl, setting.logoPublicId);
    }
    updateData.logoUrl = req.file.path || `/uploads/${req.file.filename}`;
    updateData.logoPublicId = req.file.filename || '';
  }

  const updatedSetting = await Setting.findByIdAndUpdate(setting._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      setting: updatedSetting,
    },
  });
});
