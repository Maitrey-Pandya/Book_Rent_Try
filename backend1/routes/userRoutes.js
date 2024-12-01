// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', userController.signup);

// Protected user routes
router.use(protect);
router.use(restrictTo('user'));

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

router.post('/:userId/rate', protect, userController.rateUser);

module.exports = router;