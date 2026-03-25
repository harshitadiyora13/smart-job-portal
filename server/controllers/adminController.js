const User = require('../models/User.js');
const Job = require('../models/Job.js');
const Review = require('../models/Review.js');
const Recruiter = require('../models/Recruiter.js');
const Application = require('../models/Application.js');
const Category = require('../models/Category.js');

// =======================
// GET ALL USERS
// =======================
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// =======================
// GET USER BY ID
// =======================
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

// =======================
// DELETE USER
// =======================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user && req.user._id && req.user._id.toString() === id) {
            return res.status(400).json({ message: 'Admin cannot delete their own account' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// =======================
// UPDATE USER ROLE
// =======================
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'recruiter', 'admin'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid role. Must be user, recruiter, or admin'
            });
        }

        const user = await User.findByIdAndUpdate(id, { role });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            message: 'Failed to update user role',
            error: error.message
        });
    }
};

// =======================
// GET PLATFORM STATS
// =======================
exports.getPlatformStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalJobs,
            totalReviews,
            totalApplications,
            totalCompanies,
            pendingJobApprovals
        ] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
            Review.countDocuments(),
            Application.countDocuments(),
            Recruiter.countDocuments(),
            Job.countDocuments({ status: 'pending' })
        ]);

        res.json({
            stats: {
                users: totalUsers,
                jobs: totalJobs,
                reviews: totalReviews,
                applications: totalApplications,
                companies: totalCompanies,
                pendingJobApprovals,
                monthlyRevenue: 0
            }
        });
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({
            message: 'Failed to fetch platform stats',
            error: error.message
        });
    }
};

// =======================
// REMOVE JOB
// =======================
exports.removeJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        res.json({
            message: 'Job removed successfully'
        });
    } catch (error) {
        console.error('Error removing job:', error);
        res.status(500).json({
            message: 'Failed to remove job',
            error: error.message
        });
    }
};

// =======================
// REMOVE REVIEW
// =======================
exports.removeReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        res.json({
            message: 'Review removed successfully'
        });
    } catch (error) {
        console.error('Error removing review:', error);
        res.status(500).json({
            message: 'Failed to remove review',
            error: error.message
        });
    }
};

// =======================
// LIST PENDING JOBS
// =======================
exports.getPendingJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');

        return res.json({ jobs });
    } catch (error) {
        console.error('Error fetching pending jobs:', error);
        return res.status(500).json({
            message: 'Failed to fetch pending jobs',
            error: error.message
        });
    }
};

// =======================
// APPROVE / REJECT JOB
// =======================
exports.updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.status = status;
        await job.save();

        return res.json({ message: `Job ${status} successfully`, job });
    } catch (error) {
        console.error('Error updating job status:', error);
        return res.status(500).json({
            message: 'Failed to update job status',
            error: error.message
        });
    }
};

// =======================
// LIST CATEGORIES
// =======================
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        return res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// =======================
// CREATE CATEGORY
// =======================
exports.createCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;

        if (!name || !icon) {
            return res.status(400).json({ message: 'name and icon are required' });
        }

        const category = await Category.create({ name, icon });
        return res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(409).json({ message: 'Category already exists' });
        }
        console.error('Error creating category:', error);
        return res.status(500).json({
            message: 'Failed to create category',
            error: error.message
        });
    }
};

// =======================
// DELETE CATEGORY
// =======================
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({
            message: 'Failed to delete category',
            error: error.message
        });
    }
};
