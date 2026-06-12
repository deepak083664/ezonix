const express = require('express');
const incomeSourceController = require('../controllers/incomeSourceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all routes

router
  .route('/')
  .get(incomeSourceController.getAllIncomeSources)
  .post(incomeSourceController.createIncomeSource);

router
  .route('/:id')
  .patch(incomeSourceController.updateIncomeSource)
  .delete(incomeSourceController.deleteIncomeSource);

module.exports = router;
