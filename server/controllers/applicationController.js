const Application = require('../models/Application.js');
const Job = require('../models/Job.js');
const Notification = require('../models/Notification.js');
const { createApplicationReceivedNotification, createApplicationStatusUpdateNotification } = require('./notificationController.js');
const mongoose = require('mongoose');

// @desc    Delete application (jobseeker only)
// @route   DELETE /v1/api/applications/:id
const deleteApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const userId = req.user._id;

        // Find the application
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Check if the application belongs to the current user
        if (application.applicant.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this application" });
        }

        // Check if application is in a status that allows deletion
        const deletableStatuses = ['pending', 'reviewed', 'shortlisted'];
        if (!deletableStatuses.includes(application.status)) {
            return res.status(400).json({
                message: "Cannot delete application. Applications can only be deleted when status is pending, reviewed, or shortlisted."
            });
        }

        // Delete the application
        await Application.findByIdAndDelete(applicationId);

        // Also delete any related notifications for this application
        await Notification.deleteMany({ relatedApplication: applicationId });

        res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply for a job
// @route   POST /v1/api/applications/apply
const applyToJob = async (req, res) => {
    try {
        const jobId = req.body.jobId;  // Get from request body
        const userId = req.user._id;

        // 1. Check if job exists
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // 2. Check if already applied
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }

        // 3. Get user's resume URL from the user data
        const User = require('../models/User.js');
        const user = await User.findById(userId);
        const resumeUrl = user?.resume || req.body.resume || null;

        if (!resumeUrl) {
            return res.status(400).json({ message: "No resume found. Please upload a resume first." });
        }

        // 4. Create application with the actual resume URL
        const application = await Application.create({
            job: jobId,
            applicant: userId,
            resume: resumeUrl
        });

        // Create notification for recruiter
        console.log('Creating notification for recruiter...');
        console.log('Application ID:', application._id);
        console.log('Application data:', application);
        try {
            await createApplicationReceivedNotification(application);
            console.log('Notification created successfully!');
        } catch (notificationError) {
            console.error('Failed to create notification:', notificationError);
            // Don't fail the application if notification fails
        }

        res.status(201).json({ message: "Applied successfully", application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applications for a specific job (Recruiter only)
// @route   GET /v1/api/applications/job/:id
const getJobApplications = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.id })
            .populate('applicant', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Count applications for multiple jobs
// @route   POST /v1/api/applications/count
const countApplications = async (req, res) => {
    try {
        const { jobIds } = req.body;
        console.log("Counting applications for jobs:", jobIds);

        const count = await Application.countDocuments({
            job: { $in: jobIds }
        });

        console.log("Total applications count:", count);
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting applications:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Application Status
// @route   PUT /v1/api/applications/status/:id
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log("Updating application status:", { id: req.params.id, status, user: req.user._id });

        // Populate 'job' to check the 'createdBy' field
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Optional: Security check (Only recruiter who posted job can update it)
        if (application.job.createdBy.toString() !== req.user._id.toString()) {
            console.log("Authorization failed:", application.job.createdBy, req.user._id);
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        const validStatuses = ['pending', 'reviewed', 'accepted', 'approved', 'shortlisted', 'rejected', 'interview_scheduled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const oldStatus = application.status;
        application.status = status;
        await application.save();
        console.log("Application updated successfully:", application);

        // Create enhanced notification for applicant
        await createApplicationStatusUpdateNotification(application, oldStatus, status);

        res.status(200).json({ message: `Application ${status} successfully`, application });
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs applied by seeker
// @route   GET /v1/api/applications/my-applications
const getMyApplications = async (req, res) => {
    try {
        // Find applications by this user and fill in job details
        const applications = await Application.find({ applicant: req.user._id })
            .populate({
                path: 'job',
                select: 'title company location jobType' // Fixed: companyName -> company
            })
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyToJob,
    getJobApplications,
    countApplications,
    updateStatus,
    getMyApplications,
    deleteApplication
};