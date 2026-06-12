const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all payment routes

router.get('/pending', paymentController.getPendingPayments);

router
  .route('/')
  .get(paymentController.getAllPayments)
  .post(paymentController.recordPayment);

module.exports = router;
