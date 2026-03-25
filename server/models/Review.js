const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    employmentStatus: {
        type: String,
        enum: ['current', 'former', 'interview'],
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    isCurrentEmployee: {
        type: Boolean,
        default: false
    },
    isFormerEmployee: {
        type: Boolean,
        default: false
    },

    // Rating categories (1-5 stars)
    overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    workLifeBalance: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    salaryBenefits: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    careerGrowth: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    companyCulture: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    management: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    workEnvironment: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    // Review content
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 50,
        maxlength: 2000
    },

    // Company response
    companyResponse: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    companyResponseDate: {
        type: Date
    },

    // Engagement metrics
    helpful: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    helpfulCount: {
        type: Number,
        default: 0
    },
    reports: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'fake', 'other']
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    reportCount: {
        type: Number,
        default: 0
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden'],
        default: 'approved' // Auto-approve for now, can be changed to pending for moderation
    },

    // Moderation
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedDate: {
        type: Date
    },
    moderationReason: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for better performance
reviewSchema.index({ companyId: 1, status: 1 });
reviewSchema.index({ userId: 1, companyId: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ overallRating: -1 });
reviewSchema.index({ helpfulCount: -1 });

// Prevent duplicate reviews from same user for same company
reviewSchema.index({ userId: 1, companyId: 1 }, { unique: true });

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function () {
    const ratings = [
        this.overallRating,
        this.workLifeBalance,
        this.salaryBenefits,
        this.careerGrowth,
        this.companyCulture,
        this.management,
        this.workEnvironment
    ];
    return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
});

// Pre-save middleware to update helpful count
reviewSchema.pre('save', async function () {
    if (this.isModified('helpful')) {
        this.helpfulCount = Array.isArray(this.helpful) ? this.helpful.length : 0;
    }
    if (this.isModified('reports')) {
        this.reportCount = Array.isArray(this.reports) ? this.reports.length : 0;
    }
});

// Static methods
reviewSchema.statics.getCompanyStats = async function (companyId) {
    const companyObjectId = mongoose.Types.ObjectId.isValid(companyId)
        ? new mongoose.Types.ObjectId(companyId)
        : companyId;

    const stats = await this.aggregate([
        { $match: { companyId: companyObjectId, status: 'approved' } },
        {
            $group: {
                _id: '$companyId',
                totalReviews: { $sum: 1 },
                averageOverall: { $avg: '$overallRating' },
                averageWorkLifeBalance: { $avg: '$workLifeBalance' },
                averageSalaryBenefits: { $avg: '$salaryBenefits' },
                averageCareerGrowth: { $avg: '$careerGrowth' },
                averageCompanyCulture: { $avg: '$companyCulture' },
                averageManagement: { $avg: '$management' },
                averageWorkEnvironment: { $avg: '$workEnvironment' },
                ratingDistribution: {
                    $push: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$overallRating', 5] }, then: 5 },
                                { case: { $eq: ['$overallRating', 4] }, then: 4 },
                                { case: { $eq: ['$overallRating', 3] }, then: 3 },
                                { case: { $eq: ['$overallRating', 2] }, then: 2 },
                                { case: { $eq: ['$overallRating', 1] }, then: 1 }
                            ],
                            default: 0
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                averageRating: {
                    $divide: [
                        {
                            $add: [
                                '$averageOverall',
                                '$averageWorkLifeBalance',
                                '$averageSalaryBenefits',
                                '$averageCareerGrowth',
                                '$averageCompanyCulture',
                                '$averageManagement',
                                '$averageWorkEnvironment'
                            ]
                        },
                        7
                    ]
                }
            }
        }
    ]);

    return stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        averageOverall: 0,
        averageWorkLifeBalance: 0,
        averageSalaryBenefits: 0,
        averageCareerGrowth: 0,
        averageCompanyCulture: 0,
        averageManagement: 0,
        averageWorkEnvironment: 0,
        ratingDistribution: []
    };
};

module.exports = mongoose.model('Review', reviewSchema);
