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
  const { bookId, quantity, type, rentalDuration } = req.body;

  // Validate book availability
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  if (book.status !== 'available') {
    return next(new AppError('Book is not available', 400));
  }

  // Validate rental/purchase type against book listing type
  if (type === 'rent' && !['lease', 'both'].includes(book.listingType)) {
    return next(new AppError('This book is not available for rent', 400));
  }

  if (type === 'purchase' && !['sale', 'both'].includes(book.listingType)) {
    return next(new AppError('This book is not available for purchase', 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
  }

  // Calculate price based on type
  const price = type === 'rent' ? book.price.lease.perDay : book.price.sale;

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.book.toString() === bookId && item.type === type
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
    if (type === 'rent') {
      cart.items[existingItemIndex].rentalDuration = rentalDuration;
    }
  } else {
    cart.items.push({
      book: bookId,
      quantity,
      type,
      price,
      ...(type === 'rent' && { rentalDuration })
    });
  }

  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
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