import express from 'express';
import { applyToJob, getJobApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Seekers can apply
router.post('/apply/:id', protect, authorize('seeker'), applyToJob);

// Only Recruiters can see applications for their jobs
router.get('/job/:id', protect, authorize('recruiter'), getJobApplications);

export default router;