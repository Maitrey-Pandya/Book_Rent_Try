// src/controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.book');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('No items in cart', 400));
  }

  // Verify all items are still available
  for (const item of cart.items) {
    const book = await Book.findById(item.book);
    if (book.status !== 'available') {
      return next(new AppError(`${book.title} is no longer available`, 400));
    }
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    totalAmount: cart.totalAmount,
    shippingAddress,
    paymentMethod
  });

  // Update book status
  for (const item of cart.items) {
    await Book.findByIdAndUpdate(item.book, {
      status: item.type === 'rent' ? 'rented' : 'sold'
    });
  }

  // Clear cart
  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.book')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('items.book');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});