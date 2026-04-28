const Review = require('../models/Review');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const {
            companyId,
            jobTitle,
            employmentStatus,
            startDate,
            endDate,
            overallRating,
            workLifeBalance,
            salaryBenefits,
            careerGrowth,
            companyCulture,
            management,
            workEnvironment,
            content
        } = req.body;

        // Validate required fields
        if (!companyId || !jobTitle || !employmentStatus || !content) {
            return res.status(400).json({
                message: 'Missing required fields: companyId, jobTitle, employmentStatus, content'
            });
        }

        // Validate ratings
        const ratings = [overallRating, workLifeBalance, salaryBenefits, careerGrowth, companyCulture, management, workEnvironment];
        for (const rating of ratings) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: 'All ratings must be between 1 and 5'
                });
            }
        }

        // Check if user has already reviewed this company
        const existingReview = await Review.findOne({
            userId: req.user.id,
            companyId: companyId
        });

        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this company'
            });
        }

        // Create new review
        const review = new Review({
            companyId,
            userId: req.user.id,
            jobTitle,
            employmentStatus,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isCurrentEmployee: employmentStatus === 'current',
            isFormerEmployee: employmentStatus === 'former',
            overallRating,
            workLifeBalance,
            salaryBenefits,
            careerGrowth,
            companyCulture,
            management,
            workEnvironment,
            content
        });

        await review.save();

        // Populate user information for response
        await review.populate('userId', 'name email');

        res.status(201).json({
            message: 'Review created successfully',
            review
        });

    } catch (error) {
        console.error('Error creating review:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: 'You have already reviewed this company'
            });
        }

        res.status(500).json({
            message: 'Failed to create review',
            error: error.message
        });
    }
};

// Get reviews for a company
exports.getCompanyReviews = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { filter = 'all', sortBy = 'newest', page = 1, limit = 10 } = req.query;

        const companyObjectId = mongoose.Types.ObjectId.isValid(companyId)
            ? new mongoose.Types.ObjectId(companyId)
            : companyId;

        // Build query
        let query = { companyId: companyObjectId, status: 'approved' };

        // Apply filters
        if (filter === 'current') {
            query.isCurrentEmployee = true;
        } else if (filter === 'former') {
            query.isFormerEmployee = true;
        } else if (filter === 'interview') {
            query.employmentStatus = 'interview';
        }

        // Build sort options
        let sort = {};
        switch (sortBy) {
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'highest':
                sort = { overallRating: -1 };
                break;
            case 'lowest':
                sort = { overallRating: 1 };
                break;
            case 'helpful':
                sort = { helpfulCount: -1 };
                break;
            default: // newest
                sort = { createdAt: -1 };
        }

        // Get reviews with pagination
        const skip = (page - 1) * limit;

        const reviews = await Review.find(query)
            .populate('userId', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Review.countDocuments(query);

        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching company reviews:', error);
        res.status(500).json({
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// Get review statistics for a company
exports.getCompanyReviewStats = async (req, res) => {
    try {
        const { companyId } = req.params;

        const stats = await Review.getCompanyStats(companyId);

        res.json(stats);

    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({
            message: 'Failed to fetch review statistics',
            error: error.message
        });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { content, overallRating, workLifeBalance, salaryBenefits, careerGrowth, companyCulture, management, workEnvironment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'You can only update your own reviews'
            });
        }

        // Update content
        if (content !== undefined) {
            if (content.length < 50) {
                return res.status(400).json({
                    message: 'Review content must be at least 50 characters'
                });
            }
            if (content.length > 2000) {
                return res.status(400).json({
                    message: 'Review content must be less than 2000 characters'
                });
            }
            review.content = content;
        }

        // Update ratings if provided
        if (overallRating !== undefined) review.overallRating = overallRating;
        if (workLifeBalance !== undefined) review.workLifeBalance = workLifeBalance;
        if (salaryBenefits !== undefined) review.salaryBenefits = salaryBenefits;
        if (careerGrowth !== undefined) review.careerGrowth = careerGrowth;
        if (companyCulture !== undefined) review.companyCulture = companyCulture;
        if (management !== undefined) review.management = management;
        if (workEnvironment !== undefined) review.workEnvironment = workEnvironment;

        await review.save();
        await review.populate('userId', 'name email');

        res.json({
            message: 'Review updated successfully',
            review
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            message: 'Failed to update review',
            error: error.message
        });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if user owns this review or is admin
        if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'You can only delete your own reviews'
            });
        }

        await Review.findByIdAndDelete(reviewId);

        res.json({
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if user already marked as helpful
        const isAlreadyHelpful = review.helpful.includes(req.user.id);

        if (isAlreadyHelpful) {
            // Remove from helpful
            review.helpful.pull(req.user.id);
        } else {
            // Add to helpful
            review.helpful.push(req.user.id);
        }

        await review.save();

        res.json({
            message: isAlreadyHelpful ? 'Review unmarked as helpful' : 'Review marked as helpful',
            helpfulCount: review.helpful.length,
            isHelpful: !isAlreadyHelpful
        });

    } catch (error) {
        console.error('Error marking review helpful:', error);
        res.status(500).json({
            message: 'Failed to update helpful status',
            error: error.message
        });
    }
};

// Report a review
exports.reportReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason = 'other' } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if user already reported this review
        const existingReport = review.reports.find(report =>
            report.userId.toString() === req.user.id
        );

        if (existingReport) {
            return res.status(400).json({
                message: 'You have already reported this review'
            });
        }

        // Add report
        review.reports.push({
            userId: req.user.id,
            reason
        });

        // Auto-hide review if it has too many reports (e.g., 5+)
        if (review.reports.length >= 5) {
            review.status = 'hidden';
        }

        await review.save();

        res.json({
            message: 'Review reported successfully',
            reportCount: review.reports.length
        });

    } catch (error) {
        console.error('Error reporting review:', error);
        res.status(500).json({
            message: 'Failed to report review',
            error: error.message
        });
    }
};

// Respond to a review (company owner only)
exports.respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { response } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if user is the company owner
        if (review.companyId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Only company owners can respond to reviews'
            });
        }

        // Validate response
        if (!response || response.trim().length === 0) {
            return res.status(400).json({
                message: 'Response cannot be empty'
            });
        }

        if (response.length > 1000) {
            return res.status(400).json({
                message: 'Response must be less than 1000 characters'
            });
        }

        // Update response
        review.companyResponse = response;
        review.companyResponseDate = new Date();

        await review.save();
        await review.populate('userId', 'name email');

        res.json({
            message: 'Response added successfully',
            review
        });

    } catch (error) {
        console.error('Error responding to review:', error);
        res.status(500).json({
            message: 'Failed to add response',
            error: error.message
        });
    }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ userId: req.user.id })
            .populate('companyId', 'companyName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ userId: req.user.id });

        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({
            message: 'Failed to fetch user reviews',
            error: error.message
        });
    }
};
