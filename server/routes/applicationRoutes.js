const express = require('express');

const { applyToJob, getJobApplications, countApplications, deleteApplication } = require('../controllers/applicationController.js');

const { protect, authorize } = require('../middleware/authMiddleware.js');

const { updateStatus, getMyApplications } = require('../controllers/applicationController.js');

const router = express.Router();

// Only Seekers can apply
router.post('/apply', protect, authorize('jobseeker'), applyToJob);

// Only Recruiters can see applications for their jobs
router.post('/count', protect, authorize('recruiter'), countApplications);

router.get('/job/:id', protect, authorize('recruiter'), getJobApplications);

router.put('/status/:id', protect, authorize('recruiter'), updateStatus);

router.get('/my-applications', protect, authorize('jobseeker'), getMyApplications);

// Only Seekers can delete their own applications
router.delete('/:id', protect, authorize('jobseeker'), deleteApplication);

module.exports = router;