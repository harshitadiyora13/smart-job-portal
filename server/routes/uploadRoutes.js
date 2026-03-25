const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Use company image multer configuration
const upload = require('../config/multerCompany.js');

// Upload company image (logo or banner)
router.post('/company-image', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }

        // Return the full URL for the uploaded file
        const fileUrl = `http://localhost:5000/uploads/company-images/${req.file.filename}`;

        console.log('File uploaded successfully:', {
            filename: req.file.filename,
            path: fileUrl,
            size: req.file.size
        });

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error.message
        });
    }
});

module.exports = router;
