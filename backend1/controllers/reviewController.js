// src/controllers/reviewController.js
const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createReview = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const { rating, review, orderType } = req.body;

  // Verify user has purchased/rented the book
  const order = await Order.findOne({
    user: req.user.id,
    'items.book': bookId,
    'items.type': orderType,
    status: 'delivered'
  });

  if (!order) {
    return next(new AppError('You can only review books you have purchased or rented', 403));
  }

  const newReview = await Review.create({
    user: req.user.id,
    book: bookId,
    rating,
    review,
    orderType
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

exports.getBookReviews = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  const reviews = await Review.find({ book: bookId })
    .populate('user', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  const updatedReview = await Review.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id
    },
    { rating, review },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedReview) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview
    }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
