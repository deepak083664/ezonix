const express = require('express');
const planController = require('../controllers/planController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public / optional auth route to list active plans
router.get('/', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
}, planController.getAllPlans);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', planController.createPlan);

router.route('/:id')
  .get(planController.getPlan)
  .put(planController.updatePlan)
  .delete(planController.deletePlan);

module.exports = router;
