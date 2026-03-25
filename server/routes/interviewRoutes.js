const express = require('express');
const Interview = require('../models/Interview.js');
const Job = require('../models/Job.js');
const Application = require('../models/Application.js');
const { protect } = require('../middleware/authMiddleware.js');
const { createInterviewScheduledNotification } = require('../controllers/notificationController.js');

const router = express.Router();

// Schedule a new interview
router.post('/schedule', protect, async (req, res) => {
    try {
        const { applicantId, jobId, date, time, type, notes } = req.body;

        // Validate required fields
        if (!applicantId || !jobId || !date || !time) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const scheduledAt = new Date(`${date}T${time}`);
        if (Number.isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ message: 'Invalid date/time' });
        }

        if (scheduledAt.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Interview cannot be scheduled in the past' });
        }

        // Time validation: Only allow between 9:00 AM and 5:00 PM (17:00)
        const hours = scheduledAt.getHours();
        if (hours < 9 || hours >= 17) {
            return res.status(400).json({ message: 'Interviews can only be scheduled between 9:00 AM and 5:00 PM' });
        }

        // Check if job exists and belongs to recruiter
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to schedule interview for this job' });
        }

        // Convert applicantId from email to ObjectId if it's an email
        let applicant;
        if (typeof applicantId === 'string' && applicantId.includes('@')) {
            // It's an email, find the user by email
            const User = require('../models/User');
            applicant = await User.findOne({ email: applicantId, role: 'jobseeker' });
            if (!applicant) {
                return res.status(404).json({ message: 'Applicant not found' });
            }
        } else {
            // It's already an ObjectId, validate it exists
            const User = require('../models/User');
            applicant = await User.findById(applicantId);
            if (!applicant) {
                return res.status(404).json({ message: 'Applicant not found' });
            }
        }

        // Check if applicant has applied for this job
        // NOTE: Application model fields are `job` and `applicant` (not `jobId`/`applicantId`).
        const application = await Application.findOne({
            job: jobId,
            applicant: applicant._id,
            status: { $in: ['pending', 'reviewed', 'accepted', 'approved', 'shortlisted'] }
        });

        if (!application) {
            const anyApplication = await Application.findOne({
                job: jobId,
                applicant: applicant._id
            }).select('status');

            if (!anyApplication) {
                return res.status(400).json({ message: 'Applicant has not applied for this job' });
            }

            return res.status(400).json({
                message: 'Application is not in a valid status for interview scheduling',
                status: anyApplication.status
            });
        }

        // Check if interview already exists
        const existingInterview = await Interview.findOne({
            jobId,
            applicantId: applicant._id,
            status: { $in: ['scheduled', 'completed'] }
        });

        if (existingInterview) {
            return res.status(400).json({ message: 'Interview already scheduled for this applicant' });
        }

        // Check if the date is a weekend (Saturday = 6, Sunday = 0)
        const dayOfWeek = scheduledAt.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.status(400).json({
                message: 'Interviews cannot be scheduled on weekends. Please choose a weekday.'
            });
        }

        // Check if applicant already has an interview on the same day
        const sameDayInterview = await Interview.findOne({
            applicantId: applicant._id,
            date: {
                $gte: new Date(scheduledAt.setHours(0, 0, 0, 0)),
                $lt: new Date(scheduledAt.setHours(23, 59, 59, 999))
            },
            status: 'scheduled'
        });

        if (sameDayInterview) {
            return res.status(400).json({
                message: 'Applicant already has an interview scheduled on this day. Please choose a different date.'
            });
        }

        // Create interview
        const interview = new Interview({
            jobId,
            applicantId: applicant._id,
            recruiterId: req.user._id,
            date: scheduledAt,
            time,
            type: type || 'video',
            notes: notes || ''
        });

        await interview.save();

        // Update application status
        // Ensure enum allows interview_scheduled (it exists in Application model).
        application.status = 'interview_scheduled';
        await application.save();

        // Create notification for applicant
        await createInterviewScheduledNotification(interview);

        res.status(201).json({
            message: 'Interview scheduled successfully',
            interview: {
                ...interview.toObject(),
                jobTitle: job.title,
                applicantName: applicant.name
            }
        });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all interviews for a recruiter
router.get('/', protect, async (req, res) => {
    try {
        const interviews = await Interview.find({ recruiterId: req.user._id })
            .populate('jobId', 'title company')
            .populate('applicantId', 'name email')
            .sort({ date: 1, time: 1 });

        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get interviews for a specific job
router.get('/job/:jobId', protect, async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if job belongs to recruiter
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view interviews for this job' });
        }

        const interviews = await Interview.find({ jobId })
            .populate('applicantId', 'name email')
            .sort({ date: 1, time: 1 });

        res.json(interviews);
    } catch (error) {
        console.error('Error fetching job interviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update interview status
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const interviewId = req.params.id;

        if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Check if interview belongs to recruiter
        if (interview.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this interview' });
        }

        interview.status = status;
        await interview.save();

        res.json({
            message: 'Interview status updated successfully',
            interview
        });
    } catch (error) {
        console.error('Error updating interview status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete interview
router.delete('/:id', protect, async (req, res) => {
    try {
        const interviewId = req.params.id;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Check if interview belongs to recruiter
        if (interview.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this interview' });
        }

        await Interview.findByIdAndDelete(interviewId);

        // Update application status back to pending
        await Application.findOneAndUpdate(
            { job: interview.jobId, applicant: interview.applicantId },
            { status: 'pending' }
        );

        res.json({ message: 'Interview deleted successfully' });
    } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
