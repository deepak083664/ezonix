const express = require('express');
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // Secure all expense routes

router
  .route('/')
  .get(expenseController.getAllExpenses)
  .post(upload.single('receipt'), expenseController.createExpense);

router
  .route('/:id')
  .patch(upload.single('receipt'), expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

module.exports = router;
