const express = require('express');
const router = express.Router();
const {
    createReview,
    getCompanyReviews,
    getCompanyReviewStats,
    updateReview,
    deleteReview,
    markReviewHelpful,
    reportReview,
    respondToReview,
    getUserReviews
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// POST /api/reviews - Create a new review
router.post('/', createReview);

// GET /api/reviews/company/:companyId - Get reviews for a company
router.get('/company/:companyId', getCompanyReviews);

// GET /api/reviews/stats/:companyId - Get review statistics for a company
router.get('/stats/:companyId', getCompanyReviewStats);

// PUT /api/reviews/:reviewId - Update a review
router.put('/:reviewId', updateReview);

// DELETE /api/reviews/:reviewId - Delete a review
router.delete('/:reviewId', deleteReview);

// POST /api/reviews/:reviewId/helpful - Mark review as helpful
router.post('/:reviewId/helpful', markReviewHelpful);

// POST /api/reviews/:reviewId/report - Report a review
router.post('/:reviewId/report', reportReview);

// POST /api/reviews/:reviewId/respond - Respond to a review (company owner)
router.post('/:reviewId/respond', respondToReview);

// GET /api/reviews/user - Get current user's reviews
router.get('/user', getUserReviews);

module.exports = router;
