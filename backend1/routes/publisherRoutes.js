// src/routes/publisherRoutes.js
const express = require('express');
const publisherController = require('../controllers/publisherController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', publisherController.signup);

// Protected publisher routes
router.use(protect);
router.use(restrictTo('publisher'));

router.get('/profile', publisherController.getProfile);
router.patch('/profile', publisherController.updateProfile);

module.exports = router;