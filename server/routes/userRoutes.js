import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes require the 'protect' middleware
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, authorize('seeker', 'recruiter'), updateUserProfile);

export default router;