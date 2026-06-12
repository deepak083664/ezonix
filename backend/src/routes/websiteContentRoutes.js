const express = require('express');
const websiteContentController = require('../controllers/websiteContentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route to fetch landing page blocks
router.get('/', websiteContentController.getLandingPageContent);

// Protected routes (Admin only)
router.put('/:key', protect, restrictTo('admin'), websiteContentController.updateSectionContent);

module.exports = router;
