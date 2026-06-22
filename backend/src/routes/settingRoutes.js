const express = require('express');
const settingController = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // Secure settings

router.get('/', settingController.getSettings);
router.patch('/', restrictTo('admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'qrCode1', maxCount: 1 }, { name: 'qrCode2', maxCount: 1 }]), settingController.updateSettings);

module.exports = router;
