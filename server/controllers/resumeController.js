const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/resumes';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// @desc    Upload resume
// @route   POST /v1/api/users/upload-resume
// @access  Private (jobseeker only)
const uploadResume = async (req, res) => {
    try {
        const user = req.user;

        // Check if user is a jobseeker
        if (user.role !== 'jobseeker') {
            return res.status(403).json({ message: 'Only jobseekers can upload resumes' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create URL path for frontend access (starts with /uploads/)
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;

        // Delete old resume file if exists (extract file path from URL)
        if (user.resume) {
            const oldFilePath = user.resume.startsWith('/uploads/')
                ? path.join(__dirname, '../', user.resume)
                : user.resume;
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Update user with new resume URL path
        user.resume = resumeUrl;
        await user.save();

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resumeUrl: resumeUrl,
            fileName: req.file.filename
        });

    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get resume
// @route   GET /v1/api/users/resume
// @access  Private
const getResume = async (req, res) => {
    try {
        const user = req.user;

        if (!user.resume) {
            return res.status(404).json({ message: 'No resume found' });
        }

        if (!fs.existsSync(user.resume)) {
            return res.status(404).json({ message: 'Resume file not found' });
        }

        res.sendFile(path.resolve(user.resume));
    } catch (error) {
        console.error('Error getting resume:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete resume
// @route   DELETE /v1/api/users/resume
// @access  Private (jobseeker only)
const deleteResume = async (req, res) => {
    try {
        const user = req.user;

        // Check if user is a jobseeker
        if (user.role !== 'jobseeker') {
            return res.status(403).json({ message: 'Only jobseekers can delete resumes' });
        }

        if (!user.resume) {
            return res.status(404).json({ message: 'No resume found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(user.resume)) {
            fs.unlinkSync(user.resume);
        }

        // Remove resume path from user
        user.resume = undefined;
        await user.save();

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadResume,
    getResume,
    deleteResume,
    upload // Export multer middleware
};
