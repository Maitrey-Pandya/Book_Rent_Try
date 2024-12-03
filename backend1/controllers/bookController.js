// controllers/bookController.js
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.addBook = catchAsync(async (req, res, next) => {
  console.log('Raw request body:', req.body);
  
  let bookData;
  try {
    // Parse the JSON string back into an object
    bookData = JSON.parse(req.body.bookData);
    console.log('Parsed book data:', bookData);
  } catch (error) {
    console.error('Error parsing book data:', error);
    return next(new AppError('Invalid book data format', 400));
  }

  if (!req.file) {
    return next(new AppError('Cover image is required', 400));
  }


  const uploaderType = req.user.role === 'publisher' ? 'Publisher' : 'User';
  
  // Combine the parsed data with user info
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
      .select('isbn title author genre description rating totalRatings status listingType price coverImage createdAt condition leaseTerms')
      .populate('uploader')
      .populate('publisher');
    console.log(books);
    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books
      }
    });
  });

exports.getBook = catchAsync(async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .select('isbn title author genre description rating totalRatings status listingType price uploader uploaderType publisher coverImage createdAt condition leaseTerms')
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

    console.log('Book details fetched:', book); // Debug log to verify data

    res.status(200).json({
      status: 'success',
      data: {
        book
      }
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    next(error);
  }
});

exports.getAllBooks = async (req, res, next) => {
  try {
    console.group('\n=== Search Request Started ===');
    console.log('Raw query params:', req.query);
    console.log('Headers:', req.headers);

    // Start with empty query object to get all books
    let queryObj = {};
    console.log('Initial query object:', queryObj);

    // Add status filter for available books
    queryObj.$or = [
      { status: 'available' },
      { status: { $exists: false } }
    ];
    console.log('After status filter:', JSON.stringify(queryObj, null, 2));

    // Search filter
    if (req.query.search) {
      console.log('Processing search term:', req.query.search);
      const searchTerm = req.query.search.trim();
      if (searchTerm) {
        queryObj = {
          $and: [
            queryObj,
            {
              $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { author: { $regex: searchTerm, $options: 'i' } },
                { isbn: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
              ]
            }
          ]
        };
        console.log('After search filter:', JSON.stringify(queryObj, null, 2));
      }
    }

    // Genre filter with logging
    if (req.query.genre) {
      console.log('Processing genre:', req.query.genre);
      const genre = req.query.genre.trim();
      if (genre && genre !== 'all') {
        queryObj = {
          $and: [
            queryObj,
            { genre: genre }
          ]
        };
        console.log('After genre filter:', JSON.stringify(queryObj, null, 2));
      }
    }

    // Listing type filter with logging
    if (req.query.listingType) {
      console.log('Processing listing type:', req.query.listingType);
      const listingType = req.query.listingType.trim();
      if (listingType && listingType !== 'all') {
        const listingTypeCondition = 
          listingType === 'sale' ? { $in: ['sale', 'both'] } :
          listingType === 'lease' ? { $in: ['lease', 'both'] } :
          'both';
        
        queryObj = {
          $and: [
            queryObj,
            { listingType: listingTypeCondition }
          ]
        };
        console.log('After listing type filter:', JSON.stringify(queryObj, null, 2));
      }
    }

    let query = Book.find(queryObj);
    console.log('Mongoose query filter:', query.getFilter());

    // Apply sorting
    const sortBy = req.query.sortBy?.trim() || 'date_desc';
    const [field, order] = sortBy.split('_');
    const sortOrder = order === 'desc' ? -1 : 1;

    let sortObj = { createdAt: -1 }; // Default sort
    
    if (field !== 'date' || order !== 'desc') {
      switch (field) {
        case 'price':
          sortObj = req.query.listingType === 'lease' 
            ? { 'price.lease.perMonth': sortOrder }
            : { 'price.sale': sortOrder };
          break;
        case 'rating':
          sortObj = { rating: sortOrder, totalRatings: sortOrder };
          break;
        case 'popularity':
          sortObj = { totalRatings: sortOrder, rating: sortOrder };
          break;
      }
    }

    query = query.sort(sortObj)
      .select('isbn title author genre description rating totalRatings status listingType price createdAt coverImage')
      .populate({
        path: 'uploader',
        select: 'name readersScore totalRatings'
      })
      .populate('publisher', 'name');

    const books = await query.exec();
    console.log(`Query returned ${books.length} books`);
    console.log('Sample of first book:', books[0]);
    console.groupEnd();

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    res.status(200).json({
      status: 'success',
      results: books.length,
      data: { books }
    });

  } catch (error) {
    console.error('Error in getAllBooks:', error);
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