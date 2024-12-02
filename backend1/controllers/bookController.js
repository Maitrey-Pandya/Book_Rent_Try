// controllers/bookController.js
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.addBook = catchAsync(async (req, res, next) => {
  console.log('Raw request body:', req.body);
  console.log('File:', req.file);
  
  let bookData;
  try {
    bookData = JSON.parse(req.body.bookData);
  } catch (error) {
    return next(new AppError('Invalid book data format', 400));
  }

  if (!req.file) {
    return next(new AppError('Cover image is required', 400));
  }

  const uploaderType = req.user.role === 'publisher' ? 'Publisher' : 'User';
  
  const finalBookData = {
    ...bookData,
    uploader: req.user.id,
    uploaderType,
    publisher: uploaderType === 'Publisher' ? req.user.id : bookData.publisher,
    coverImage: req.file.path || req.file.secure_url
  };

  console.log('Final book data to save:', finalBookData);

  const book = await Book.create(finalBookData);
  
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
    .select('isbn title author genre description rating totalRatings status listingType price coverImage')
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
  const book = await Book.findById(req.params.id)
    .select('isbn title author genre description rating totalRatings status listingType price uploader uploaderType publisher coverImage condition createdAt')
    .populate({
      path: 'uploader',
      select: 'name publisherName'
    })
    .populate({
      path: 'publisher',
      select: 'name publisherName'
    });

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

exports.getAllBooks = async (req, res, next) => {
  try {
    // Log initial request
    console.log('\n=== Search Request Started ===');
    console.log('Raw query params:', req.query);

    // Start with a base query
    let queryObj = {};

    // Search functionality
    if (req.query.search && req.query.search.trim() !== '') {
      const searchTerm = req.query.search.trim();
      queryObj.$or = [
        { title: new RegExp(searchTerm, 'i') },
        { author: new RegExp(searchTerm, 'i') },
        { isbn: new RegExp(searchTerm, 'i') }
      ];
      console.log('Search filter applied:', searchTerm);
    }

    // Genre filter
    if (req.query.genre && req.query.genre !== 'all') {
      queryObj.genre = req.query.genre;
      console.log('Genre filter applied:', req.query.genre);
    }

    // Listing type filter
    if (req.query.listingType) {
      console.log('Processing listing type:', req.query.listingType);
      
      switch (req.query.listingType) {
        case 'sale':
          queryObj.listingType = { $in: ['sale', 'both'] };
          console.log('Listing type filter: sale or both');
          break;
        case 'lease':
          queryObj.listingType = { $in: ['lease', 'both'] };
          console.log('Listing type filter: lease or both');
          break;
        case 'both':
          queryObj.listingType = 'both';
          console.log('Listing type filter: both only');
          break;
        default:
          console.log('Invalid listing type:', req.query.listingType);
      }
    }

    console.log('Constructed query object:', JSON.stringify(queryObj, null, 2));

    // Build the query
    let query = Book.find(queryObj);

    // Sorting
    if (req.query.sortBy) {
      const [field, order] = req.query.sortBy.split('_');
      const sortOrder = order === 'desc' ? -1 : 1;
      
      console.log('Sort parameters:', { field, order, sortOrder });
      
      let sortObj = {};
      switch (field) {
        case 'price':
          sortObj = {
            'price.sale': sortOrder,
            'price.lease.perMonth': sortOrder
          };
          console.log('Applying price sort');
          break;
        case 'date':
          sortObj = { createdAt: sortOrder };
          console.log('Applying date sort');
          break;
        default:
          sortObj = { [field]: sortOrder };
          console.log('Applying default sort on field:', field);
      }
      
      console.log('Sort object:', sortObj);
      query = query.sort(sortObj);
    } else {
      query = query.sort({ createdAt: -1 });
      console.log('Applying default sort (newest first)');
    }

    // Log the final query
    console.log('Final Mongoose query:', query.getFilter());

    // Execute query
    const books = await query.exec();

    console.log(`Query results: Found ${books.length} books`);
    console.log('Sample of first book:', books.length > 0 ? {
      id: books[0]._id,
      title: books[0].title,
      listingType: books[0].listingType,
      genre: books[0].genre
    } : 'No books found');

    // Log any potential issues with the data
    if (books.length === 0) {
      console.log('Warning: No books found with the current filters');
    }

    console.log('=== Search Request Completed ===\n');

    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books
      }
    });
  } catch (error) {
    console.error('=== Error in getAllBooks ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    console.error('=== Error Log End ===\n');
    next(error);
  }
};

exports.updateBook = catchAsync(async (req, res, next) => {
  const bookData = req.body.bookData ? JSON.parse(req.body.bookData) : req.body;

  if (req.file) {
    bookData.coverImage = req.file.path;
  }

  const book = await Book.findByIdAndUpdate(req.params.id, bookData, {
    new: true,
    runValidators: true
  });

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

exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});