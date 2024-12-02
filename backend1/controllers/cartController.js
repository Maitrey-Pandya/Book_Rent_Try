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
  console.log('Received request to add to cart:', { bookId, type, userId: req.user.id });

  // Validate book availability
  const book = await Book.findById(bookId);
  if (!book) {
    console.log('Book not found:', bookId);
    return next(new AppError('Book not found', 404));
  }

  if (book.status !== 'available') {
    console.log('Book not available:', book.status);
    return next(new AppError('Book is not available', 400));
  }

  // Check if book already exists in user's cart (with improved query)
  const existingCart = await Cart.findOne({
    user: req.user.id,
    'items.book': bookId,
    'items.type': type // Also check the type (rent/purchase)
  });

  console.log('Existing cart check:', {
    exists: !!existingCart,
    userId: req.user.id,
    bookId,
    type
  });

  if (existingCart) {
    console.log('Book already in cart:', {
      cartId: existingCart._id,
      items: existingCart.items
    });
    return next(new AppError('This book is already in your cart', 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });
  console.log('Found user cart:', cart?._id);

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
    console.log('Created new cart:', cart._id);
  }

  // Calculate price based on type
  const price = type === 'rent' ? book.price.lease.perDay : book.price.sale;

  // Add new item
  const newItem = {
    book: bookId,
    quantity: 1,
    type,
    price,
    ...(type === 'rent' && { rentalDuration })
  };

  cart.items.push(newItem);
  console.log('Added new item to cart:', newItem);

  await cart.save();
  console.log('Saved cart successfully');

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