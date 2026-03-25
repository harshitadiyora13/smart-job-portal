const express = require('express');

const {
    createJob,
    getAllJobs,
    searchJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs
} = require('../controllers/jobController.js');

const Category = require('../models/Category.js');

// 1. Import the middleware we created earlier
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        return res.json({ categories });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
});
router.get('/all', getAllJobs);
router.get('/search', searchJobs);
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', getJobById);

// --- PRIVATE ROUTES (Recruiter Only) ---
// We add 'authorize("recruiter")' to ensure Seekers can't hit these endpoints
router.post('/create', protect, authorize('recruiter'), createJob);
router.put('/update/:id', protect, authorize('recruiter'), updateJob);
router.delete('/delete/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;