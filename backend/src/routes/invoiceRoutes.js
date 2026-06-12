const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all invoice routes

router
  .route('/')
  .get(invoiceController.getAllInvoices)
  .post(invoiceController.createInvoice);

router
  .route('/:id')
  .get(invoiceController.getInvoice)
  .patch(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

router.get('/:id/pdf', invoiceController.downloadInvoicePDF);

module.exports = router;
