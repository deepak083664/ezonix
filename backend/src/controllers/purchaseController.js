const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPurchases = catchAsync(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;
  let query = {};

  if (search) {
    query = {
      $or: [
        { supplierName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ],
    };
  }

  const skip = (page - 1) * limit;

  const purchases = await Purchase.find(query)
    .sort({ purchaseDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Purchase.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: purchases.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      purchases,
    },
  });
});

exports.createPurchase = catchAsync(async (req, res, next) => {
  const { supplierName, amount, purchaseDate, items, invoiceNumber } = req.body;

  // If items are provided, check if we can match any products by SKU or Name, and increment inventory stock!
  if (items && items.length > 0) {
    for (const item of items) {
      // Find product by exact SKU or Name (case insensitive)
      const product = await Product.findOne({
        $or: [{ sku: item.name.toUpperCase() }, { name: { $regex: new RegExp(`^${item.name}$`, 'i') } }],
      });

      if (product) {
        product.quantity += parseInt(item.quantity);
        await product.save();
      }
    }
  }

  const newPurchase = await Purchase.create({
    supplierName,
    amount,
    purchaseDate,
    items,
    invoiceNumber,
  });

  res.status(211).json({
    status: 'success',
    data: {
      purchase: newPurchase,
    },
  });
});

exports.deletePurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError('No purchase found with that ID', 404));
  }

  // Restore inventory stock levels (optional: subtract added quantities)
  if (purchase.items && purchase.items.length > 0) {
    for (const item of purchase.items) {
      const product = await Product.findOne({
        $or: [{ sku: item.name.toUpperCase() }, { name: { $regex: new RegExp(`^${item.name}$`, 'i') } }],
      });
      if (product) {
        product.quantity = Math.max(0, product.quantity - parseInt(item.quantity));
        await product.save();
      }
    }
  }

  await Purchase.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
