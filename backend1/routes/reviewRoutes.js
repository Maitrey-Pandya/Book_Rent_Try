// src/routes/reviewRoutes.js
const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validateReview } = require('../utils/validators');

const router = express.Router();

router.get('/book/:bookId', reviewController.getBookReviews);

router.use(protect);

router.post('/book/:bookId', validateReview, reviewController.createReview);
router.patch('/:id', validateReview, reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;