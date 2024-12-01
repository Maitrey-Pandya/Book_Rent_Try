// routes/bookRoutes.js
const express = require('express');
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBook } = require('../utils/validators');
const uploadMiddleware = require('../utils/fileUpload');

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBook);

// Protected routes
router.use(authMiddleware.protect);

router.post('/', 
  uploadMiddleware,
  validateBook,
  bookController.addBook
);

router.post('/bulk', 
  authMiddleware.restrictTo('publisher'),
  validateBook,
  bookController.bulkAddBooks
);

router.patch('/:id',
  uploadMiddleware,
  validateBook,
  bookController.updateBook
);

router.delete('/:id', bookController.deleteBook);

module.exports = router;