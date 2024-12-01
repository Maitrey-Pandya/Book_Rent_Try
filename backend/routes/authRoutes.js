const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.use(protect);
router.post('/refresh-token', authController.refreshToken);

router.get('/test-auth', protect, (req, res) => {
  res.json({
    status: 'success',
    message: 'Authentication working',
    user: req.user
  });
});

module.exports = router;