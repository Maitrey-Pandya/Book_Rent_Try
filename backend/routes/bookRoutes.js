// routes/bookRoutes.js
const express = require('express');
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBook, validateBulkBooks } = require('../utils/validators');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);

router.use(authMiddleware.protect); // Protect all routes below this middleware

router.post('/', 
  upload.single('coverImage'),
  validateBook,
  bookController.addBook
);

router.post('/bulk', 
  authMiddleware.restrictTo('publisher'),
  validateBulkBooks,
  bookController.bulkAddBooks
);

module.exports = router;