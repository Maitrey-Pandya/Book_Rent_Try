// src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { validateOrder } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.post('/', validateOrder, orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;