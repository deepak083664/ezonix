const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteFile } = require('../middleware/uploadMiddleware');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');
const escapeRegExp = require('../utils/escapeRegExp');

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  
  await logActivity('Category Created', `Added product category: ${newCategory.name}`, req);

  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    return next(new AppError('Cannot delete category. There are products linked to it.', 400));
  }

  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  await logActivity('Category Deleted', `Deleted product category: ${category.name}`, req);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ==========================================
// PRODUCT CONTROLLERS
// ==========================================

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { search, category, lowStock, page = 1, limit = 10 } = req.query;
  let query = {};

  if (search) {
    const escapedSearch = escapeRegExp(search);
    query = {
      $or: [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { sku: { $regex: escapedSearch, $options: 'i' } },
      ],
    };
  }

  if (category) {
    query.category = category;
  }

  if (lowStock === 'true') {
    query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const productData = { ...req.body };

  if (req.file) {
    productData.image = req.file.path || `/uploads/${req.file.filename}`;
    productData.imagePublicId = req.file.filename || '';
  }

  if (!productData.sku) {
    const categoryName = await Category.findById(productData.category);
    const prefix = categoryName ? categoryName.name.substring(0, 3).toUpperCase() : 'PROD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    productData.sku = `${prefix}-${rand}`;
  }

  const newProduct = await Product.create(productData);

  await logActivity('Product Added', `Registered product item: ${newProduct.name} (SKU: ${newProduct.sku})`, req);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (product.image) {
      await deleteFile(product.image, product.imagePublicId);
    }
    updateData.image = req.file.path || `/uploads/${req.file.filename}`;
    updateData.imagePublicId = req.file.filename || '';
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name');

  await logActivity('Product Updated', `Updated product details for: ${updatedProduct.name} (SKU: ${updatedProduct.sku})`, req);

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  if (product.image) {
    await deleteFile(product.image, product.imagePublicId);
  }

  await Product.findByIdAndDelete(req.params.id);

  await logActivity('Product Deleted', `Deleted product catalog item: ${product.name}`, req);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
