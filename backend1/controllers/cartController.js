// src/controllers/cartController.js
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.book',
      select: 'title author price status listingType'
    });

  if (!cart) {
    return next(new AppError('No cart found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  try {
    const { bookId, quantity, type, rentalDuration } = req.body;
    const userId = req.user._id;

    // Find the book first
    const book = await Book.findById(bookId);
    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Calculate price based on type
    let price;
    if (type === 'purchase') {
      price = book.price.sale;
    } else if (type === 'rent') {
      price = book.price.lease.perMonth;
    } else {
      return next(new AppError('Invalid type specified', 400));
    }

    // Find existing cart or create new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ 
        user: userId,
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId && item.type === type
    );

    if (existingItemIndex > -1) {
      return next(new AppError('This book is already in your cart', 400));
    }

    // Add new item to cart
    cart.items.push({
      book: bookId,
      quantity,
      type,
      price,
      rentalDuration
    });

    // Recalculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    next(error);
  }
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity, rentalDuration } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const cartItem = cart.items.id(itemId);
  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  if (quantity) cartItem.quantity = quantity;
  if (rentalDuration && cartItem.type === 'rent') {
    cartItem.rentalDuration = rentalDuration;
  }

  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});