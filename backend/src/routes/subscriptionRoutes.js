const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All subscription routes require logging in

router.get('/my', subscriptionController.getMySubscription);

// Admin-only routes
router.use(restrictTo('admin'));

router.route('/')
  .get(subscriptionController.getAllSubscriptions)
  .post(subscriptionController.createSubscription);

router.route('/:id')
  .put(subscriptionController.updateSubscription)
  .delete(subscriptionController.deleteSubscription);

module.exports = router;
