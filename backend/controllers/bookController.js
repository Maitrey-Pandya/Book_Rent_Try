// controllers/bookController.js
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.addBook = catchAsync(async (req, res, next) => {
  const uploaderType = req.user.role === 'publisher' ? 'Publisher' : 'User';
  
  const bookData = {
    ...req.body,
    uploader: req.user.id,
    uploaderType,
    publisher: uploaderType === 'Publisher' ? req.user.id : req.body.publisher
  };

  const book = await Book.create(bookData);
  
  res.status(201).json({
    status: 'success',
    data: {
      book
    }
  });
});

exports.bulkAddBooks = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'publisher') {
    return next(new AppError('Only publishers can use bulk upload', 403));
  }

  const booksData = req.body.books.map(book => ({
    ...book,
    uploader: req.user.id,
    uploaderType: 'Publisher',
    publisher: req.user.id
  }));

  const books = await Book.insertMany(booksData);

  res.status(201).json({
    status: 'success',
    data: {
      books
    }
  });
});

exports.getBooks = catchAsync(async (req, res, next) => {
    const books = await Book.find()
      .select('isbn title author genre description rating totalRatings status listingType price')
      .populate('uploader')
      .populate('publisher');
  
    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books
      }
    });
  });

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.find()
    .select('isbn title author genre description rating totalRatings status listingType price')
    .populate('uploader')
    .populate('publisher');

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});