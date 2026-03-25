const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume, getResume, deleteResume, upload } = require('../controllers/resumeController');

const router = express.Router();

// Upload resume
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);

// Get resume file
router.get('/resume', protect, getResume);

// Delete resume
router.delete('/resume', protect, deleteResume);

module.exports = router;
