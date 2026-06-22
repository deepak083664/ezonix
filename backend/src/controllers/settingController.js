const Setting = require('../models/Setting');
const { deleteFile } = require('../middleware/uploadMiddleware');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getSettings = catchAsync(async (req, res, next) => {
  let setting = await Setting.findOne();

  // If no settings exist yet, create a default one
  if (!setting) {
    setting = await Setting.create({
      businessName: 'ezonix',
      invoicePrefix: 'INV',
      defaultTaxRate: 18,
    });
  } else if (setting.businessName === 'ezoinx') {
    // Automatically migrate old businessName spelling
    setting.businessName = 'ezonix';
    await setting.save();
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
      businessName: 'ezonix',
      invoicePrefix: 'INV',
      defaultTaxRate: 18,
    });
  }

  const updateData = { ...req.body };

  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      const logoFile = req.files.logo[0];
      if (setting.logoUrl) {
        await deleteFile(setting.logoUrl, setting.logoPublicId);
      }
      updateData.logoUrl = logoFile.path || `/uploads/${logoFile.filename}`;
      updateData.logoPublicId = logoFile.filename || '';
    }
    if (req.files.qrCode1 && req.files.qrCode1[0]) {
      const qr1File = req.files.qrCode1[0];
      if (setting.qrCode1Url) {
        await deleteFile(setting.qrCode1Url, setting.qrCode1PublicId);
      }
      updateData.qrCode1Url = qr1File.path || `/uploads/${qr1File.filename}`;
      updateData.qrCode1PublicId = qr1File.filename || '';
    }
    if (req.files.qrCode2 && req.files.qrCode2[0]) {
      const qr2File = req.files.qrCode2[0];
      if (setting.qrCode2Url) {
        await deleteFile(setting.qrCode2Url, setting.qrCode2PublicId);
      }
      updateData.qrCode2Url = qr2File.path || `/uploads/${qr2File.filename}`;
      updateData.qrCode2PublicId = qr2File.filename || '';
    }
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
