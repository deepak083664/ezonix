const express = require('express');
const incomeController = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all routes

router
  .route('/')
  .get(incomeController.getAllIncomes)
  .post(incomeController.createIncome);

router
  .route('/:id')
  .patch(incomeController.updateIncome)
  .delete(incomeController.deleteIncome);

module.exports = router;
