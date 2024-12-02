// src/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  orderType: {
    type: String,
    enum: ['purchase', 'rent'],
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from the same user for the same book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Update book rating when a review is added or modified
reviewSchema.post('save', async function() {
  const book = await this.model('Book').findById(this.book);
  const stats = await this.model('Review').aggregate([
    {
      $match: { book: this.book }
    },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await book.updateOne({
      rating: stats[0].avgRating,
      totalRatings: stats[0].totalRatings
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
