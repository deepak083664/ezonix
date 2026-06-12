const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure reports API

router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/search', reportController.globalSearch);

// Date reports
router.get('/sales', reportController.getSalesReport);
router.get('/expenses', reportController.getExpenseReport);
router.get('/purchases', reportController.getPurchaseReport);
router.get('/incomes', reportController.getIncomeReport);

// Bulk exports
router.get('/export/json', reportController.exportCompleteJSON);
router.get('/export/excel', reportController.exportCompleteExcel);
router.get('/:reportType/excel', reportController.exportCategoryExcel);

module.exports = router;
