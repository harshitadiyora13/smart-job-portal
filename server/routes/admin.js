const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    deleteUser,
    updateUserRole,
    getPlatformStats,
    getPendingJobs,
    updateJobStatus,
    getCategories,
    createCategory,
    deleteCategory,
    removeJob,
    removeReview
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply admin middleware to all admin routes
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

// GET /api/admin/users/:id - Get a user
router.get('/users/:id', getUserById);

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', deleteUser);

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', updateUserRole);

// GET /api/admin/stats - Get platform statistics
router.get('/stats', getPlatformStats);

// GET /api/admin/jobs/pending - Get pending jobs
router.get('/jobs/pending', getPendingJobs);

// PUT /api/admin/jobs/:id/status - Approve/Reject job
router.put('/jobs/:id/status', updateJobStatus);

// GET /api/admin/categories - List categories
router.get('/categories', getCategories);

// POST /api/admin/categories - Create category
router.post('/categories', createCategory);

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', deleteCategory);

// DELETE /api/admin/jobs/:id - Remove a job
router.delete('/jobs/:id', removeJob);

// DELETE /api/admin/reviews/:id - Remove a review
router.delete('/reviews/:id', removeReview);

module.exports = router;
