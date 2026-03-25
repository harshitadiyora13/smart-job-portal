const express = require('express');
const { getUserProfile, updateUserProfile, getAllUsers, getApplicantProfileForRecruiter, uploadResume, toggleSavedJob, getSavedJobs } = require('../controllers/userController.js');
const { authorize, protect } = require('../middleware/authMiddleware.js');
const upload = require('../config/multer.js');

const router = express.Router();

// Both routes require the 'protect' middleware
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, authorize('jobseeker', 'recruiter'), updateUserProfile);
router.get('/saved-jobs', protect, authorize('jobseeker'), getSavedJobs);
router.post('/saved-jobs/:jobId/toggle', protect, authorize('jobseeker'), toggleSavedJob);
router.get('/applicants/:id', protect, authorize('recruiter'), getApplicantProfileForRecruiter);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.get('/all', getAllUsers);

module.exports = router;