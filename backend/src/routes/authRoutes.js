const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/google', authController.googleLogin);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);

module.exports = router;
