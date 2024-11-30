const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Add author field
  author: {
    type: String,
    required: true,
    trim: true
  },
  // Add genre field with predefined categories
  genre: {
    type: String,
    required: true,
    enum: [
      'Fiction',
      'Non-Fiction',
      'Science Fiction',
      'Fantasy',
      'Mystery',
      'Thriller',
      'Romance',
      'Horror',
      'Biography',
      'History',
      'Science',
      'Technology',
      'Self-Help',
      'Children',
      'Other'
    ]
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: function() {
      return this.uploaderType === 'publisher';
    }
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'uploaderType',
    required: true
  },
  uploaderType: {
    type: String,
    required: true,
    enum: ['User', 'Publisher']
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'sold'],
    default: 'available'
  },
  listingType: {
    type: String,
    enum: ['sale', 'lease', 'both'],
    required: true
  },
  price: {
    sale: {
      type: Number,
      required: function() {
        return this.listingType === 'sale' || this.listingType === 'both';
      }
    },
    lease: {
      perDay: {
        type: Number,
        required: function() {
          return this.listingType === 'lease' || this.listingType === 'both';
        }
      },
      minDuration: {
        type: Number,
        default: 1
      },
      maxDuration: {
        type: Number
      }
    }
  },
  leaseTerms: {
    type: String,
    required: function() {
      return this.listingType === 'lease' || this.listingType === 'both';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;