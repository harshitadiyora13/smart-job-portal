import express from 'express';
import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
} from '../controllers/jobController.js';

// 1. Import the middleware we created earlier
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/all', getAllJobs);
router.get('/:id', getJobById);

// --- PRIVATE ROUTES (Recruiter Only) ---
// We add 'authorize("recruiter")' to ensure Seekers can't hit these endpoints
router.post('/create', protect, authorize('recruiter'), createJob);
router.put('/update/:id', protect, authorize('recruiter'), updateJob);
router.delete('/delete/:id', protect, authorize('recruiter'), deleteJob);

export default router;