// src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const { validateOrder } = require('../utils/validators');

const router = express.Router();

// Admin routes (secured by admin API key)
router.patch('/admin/:id/status', 
  adminAuth,
  orderController.updateOrderStatus
);

// Protected user routes
router.use(protect);
router.post('/', validateOrder, orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;