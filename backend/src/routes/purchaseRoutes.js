const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all purchase routes

router
  .route('/')
  .get(purchaseController.getAllPurchases)
  .post(purchaseController.createPurchase);

router.route('/:id').delete(purchaseController.deletePurchase);

module.exports = router;
