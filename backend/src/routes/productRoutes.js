const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // Secure all product routes

// Category Routes
router
  .route('/categories')
  .get(productController.getAllCategories)
  .post(productController.createCategory);

router
  .route('/categories/:id')
  .patch(productController.updateCategory)
  .delete(productController.deleteCategory);

// Product Routes
router
  .route('/')
  .get(productController.getAllProducts)
  .post(upload.single('image'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(upload.single('image'), productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
