const express = require('express');
const settingController = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // Secure settings

router.get('/', settingController.getSettings);
router.patch('/', restrictTo('admin'), upload.single('logo'), settingController.updateSettings);

module.exports = router;
