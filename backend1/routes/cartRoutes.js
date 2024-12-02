// src/routes/cartRoutes.js
const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validateCartItem } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', validateCartItem, cartController.addToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);

module.exports = router;
