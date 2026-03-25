const Job = require('../models/Job.js');
const Category = require('../models/Category.js');

// @desc    Create a new job
// @route   POST /api/jobs/create
const createJob = async (req, res) => {
    try {
        const { title, description, company, location, salary, requirements, jobType, categoryId, categoryName } = req.body;

        // Ensure user is a recruiter (Authorized by role)
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: "Only recruiters can post jobs" });
        }

        let category;
        if (categoryId) {
            category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: "Invalid category" });
            }
        } else if (categoryName && String(categoryName).trim()) {
            const trimmedName = String(categoryName).trim();
            const escaped = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            category = await Category.findOne({ name: { $regex: `^${escaped}$`, $options: 'i' } });

            if (!category) {
                category = await Category.create({
                    name: trimmedName,
                    icon: 'tag'
                });
            }
        }

        const job = await Job.create({
            title,
            description,
            company,
            location,
            salary,
            requirements,
            category: category ? category._id : undefined,
            jobType,
            createdBy: req.user._id // Taken from the 'protect' middleware
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs (For Seekers)
// @route   GET /api/jobs/all
const getAllJobs = async (req, res) => {
    try {
        const includeAllStatuses = String(req.query.includeAllStatuses || '').toLowerCase() === 'true';
        const limit = req.query.limit ? Number(req.query.limit) : undefined;

        const query = includeAllStatuses ? {} : { status: 'approved' };

        let q = Job.find(query)
            .populate('category', 'name icon')
            .sort({ createdAt: -1 });

        if (Number.isFinite(limit) && limit > 0) {
            q = q.limit(limit);
        }

        const jobs = await q;
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        console.log('Attempting to delete job:', req.params.id);

        const job = await Job.findById(req.params.id);
        console.log('Found job:', job);

        if (!job) return res.status(404).json({ message: "Job not found" });

        // Authorization check
        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized to delete this job" });
        }

        // Delete all interviews for this job
        const Interview = require('../models/Interview.js');
        const Application = require('../models/Application.js');
        const Notification = require('../models/Notification.js');

        // Find and delete all interviews for this job
        const deletedInterviews = await Interview.deleteMany({ jobId: req.params.id });
        console.log(`Deleted ${deletedInterviews.deletedCount} interviews for job ${req.params.id}`);

        // Find and delete all applications for this job (completely remove from seekers' lists)
        const deletedApplications = await Application.deleteMany({ job: req.params.id });
        console.log(`Deleted ${deletedApplications.deletedCount} applications for job ${req.params.id}`);

        // Find and delete all notifications related to this job
        const deletedNotifications = await Notification.deleteMany({
            $or: [
                { message: { $regex: job.title, $options: 'i' } },
                { message: { $regex: job.company, $options: 'i' } }
            ]
        });
        console.log(`Deleted ${deletedNotifications.deletedCount} notifications related to job ${req.params.id}`);

        // Delete job itself
        await job.deleteOne();
        console.log('Job deleted successfully');

        res.status(200).json({
            message: "Job and all related data removed successfully",
            deletedInterviews: deletedInterviews.deletedCount,
            deletedApplications: deletedApplications.deletedCount,
            deletedNotifications: deletedNotifications.deletedCount
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search and Filter Jobs
// @route   GET /v1/api/jobs/search
const searchJobs = async (req, res) => {
    try {
        const { title, keyword, location, jobType, company, category } = req.query;

        // Create a dynamic query object
        let query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        // 1. Keyword Search (Matches Title, Description, or Requirements)
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { requirements: { $regex: keyword, $options: 'i' } }
            ];
        }

        // 2. Location Filter
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // 3. Job Type Filter (e.g., 'Full-time', 'Remote')
        if (jobType) {
            query.jobType = jobType;
        }

        if (company) {
            query.company = { $regex: company, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        query.status = 'approved';

        const jobs = await Job.find(query).populate('category', 'name icon').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyJobs = async (req, res) => {
    try {
        console.log("getMyJobs called");
        console.log("User from req:", req.user);
        console.log("User ID:", req.user._id);

        // Check ALL jobs in database first
        const allJobs = await Job.find({});
        console.log("All jobs in database:", allJobs);

        // Find jobs where 'createdBy' matches the logged-in user's ID
        const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        console.log("Found jobs for user:", jobs);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error in getMyJobs:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the job
        let job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // 2. Check if the logged-in user is the owner
        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to update this job" });
        }

        // 3. Update the job
        job = await Job.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, job });
    } catch (error) {
        console.error("Error in updateJob:", error);
        res.status(500).json({ message: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('category', 'name icon');
        if (job.status !== 'approved') {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(404).json({ message: "Job not found" });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    searchJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs
};