const express = require('express');
const { createCompanyProfile, getCompanyProfile, updateCompanyProfile } = require('../controllers/recruiterController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');
const upload = require('../config/multer.js');

const router = express.Router();

// All routes require recruiter role
router.post('/company-profile', protect, authorize('recruiter'), createCompanyProfile);
router.get('/company-profile', protect, authorize('recruiter'), getCompanyProfile);
router.get('/company-profile/:recruiterId', getCompanyProfile);
router.put('/company-profile', protect, authorize('recruiter'), updateCompanyProfile);

module.exports = router;
