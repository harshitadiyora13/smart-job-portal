const User = require('../models/User.js');
const path = require('path');
const Application = require('../models/Application.js');
const Job = require('../models/Job.js');

// @desc    Get user profile
// @route   GET /v1/api/users/profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applicant profile by userId (Recruiter only, must be an applicant to recruiter's job)
// @route   GET /v1/api/users/applicants/:id
const getApplicantProfileForRecruiter = async (req, res) => {
    try {
        const recruiterId = req.user?._id;
        const applicantId = req.params.id;

        if (!recruiterId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Ensure recruiter owns at least one job that this applicant applied to.
        const applications = await Application.find({ applicant: applicantId }).select('job');
        const jobIds = applications.map((a) => a.job).filter(Boolean);

        if (jobIds.length === 0) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        const ownedJob = await Job.findOne({ _id: { $in: jobIds }, createdBy: recruiterId }).select('_id');

        if (!ownedJob) {
            return res.status(403).json({ message: 'Not authorized to view this applicant profile' });
        }

        const applicant = await User.findById(applicantId).select('-password');
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        return res.status(200).json(applicant);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Bio, Skills, etc.)
// @route   PUT /v1/api/users/profile
const updateUserProfile = async (req, res) => {
    console.log('updateUserProfile controller called');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        const user = await User.findById(req.user._id);
        console.log('Found user:', user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Current user data:', {
            name: user.name,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            skills: user.skills,
            experience: user.experience,
            education: user.education
        });

        // Update basic fields
        if (req.body.name !== undefined) {
            console.log('Updating name from', user.name, 'to', req.body.name);
            user.name = req.body.name;
        }

        // Update profile fields - check for undefined, not falsy
        if (req.body.phone !== undefined) {
            console.log('Updating phone from', user.phone, 'to', req.body.phone);
            user.phone = req.body.phone;
        }
        if (req.body.location !== undefined) {
            console.log('Updating location from', user.location, 'to', req.body.location);
            user.location = req.body.location;
        }
        if (req.body.bio !== undefined) {
            console.log('Updating bio from', user.bio, 'to', req.body.bio);
            user.bio = req.body.bio;
        }
        if (req.body.skills !== undefined) {
            console.log('Updating skills from', user.skills, 'to', req.body.skills);
            user.skills = req.body.skills;
        }
        if (req.body.experience !== undefined) {
            console.log('Updating experience from', user.experience, 'to', req.body.experience);
            user.experience = req.body.experience;
        }
        if (req.body.education !== undefined) {
            console.log('Updating education from', user.education, 'to', req.body.education);
            user.education = req.body.education;
        }
        if (req.body.resume !== undefined) {
            console.log('Updating resume from', user.resume, 'to', req.body.resume);
            user.resume = req.body.resume;
        }

        console.log('Final user data before save:', {
            name: user.name,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            skills: user.skills,
            experience: user.experience,
            education: user.education
        });

        const updatedUser = await user.save();
        console.log('User saved successfully:', updatedUser._id);

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload resume
// @route   POST /v1/api/users/upload-resume
const uploadResume = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create file URL for frontend access
        const fileUrl = `/uploads/resumes/${req.file.filename}`;

        // Update user with resume file path
        user.resume = fileUrl;
        await user.save();

        console.log('Resume uploaded successfully:', {
            userId: user._id,
            filename: req.file.filename,
            fileUrl: fileUrl,
            originalName: req.file.originalname,
            size: req.file.size
        });

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resumeUrl: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error("Error uploading resume:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle save/unsave a job for current user (Jobseeker)
// @route   POST /v1/api/users/saved-jobs/:jobId/toggle
const toggleSavedJob = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { jobId } = req.params;

        const job = await Job.findById(jobId).select('_id');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const savedIds = (user.savedJobs || []).map((id) => id.toString());
        const alreadySaved = savedIds.includes(jobId);

        if (alreadySaved) {
            user.savedJobs = (user.savedJobs || []).filter((id) => id.toString() !== jobId);
        } else {
            user.savedJobs = [...(user.savedJobs || []), job._id];
        }

        await user.save();

        return res.status(200).json({
            success: true,
            saved: !alreadySaved,
            savedJobs: user.savedJobs
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get saved jobs for current user (Jobseeker)
// @route   GET /v1/api/users/saved-jobs
const getSavedJobs = async (req, res) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: { path: 'category', select: 'name icon' }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            savedJobs: user.savedJobs || []
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all users (Admin usually)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password"); // Find all, but hide passwords!
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    uploadResume,
    toggleSavedJob,
    getSavedJobs,
    getAllUsers,
    getApplicantProfileForRecruiter
};