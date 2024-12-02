// routes/bookRoutes.js
const express = require('express');
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBook } = require('../utils/validators');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks); // Search and filter route
router.get('/:id', bookController.getBook);

// Protected routes
router.use(authMiddleware.protect);

router.post('/', 
  upload.single('coverImage'),
  validateBook,
  bookController.addBook
);

router.post('/bulk', 
  authMiddleware.restrictTo('publisher'),
  validateBook,
  bookController.bulkAddBooks
);

router.patch('/:id',
  upload.single('coverImage'),
  validateBook,
  bookController.updateBook
);

router.delete('/:id', bookController.deleteBook);

module.exports = router;