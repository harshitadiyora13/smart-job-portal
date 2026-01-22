import Job from '../models/Job.js';

// @desc    Create a new job
// @route   POST /api/jobs/create
export const createJob = async (req, res) => {
    try {
        const { title, description, company, location, salary, requirements, jobType } = req.body;

        // Ensure user is a recruiter (Authorized by role)
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: "Only recruiters can post jobs" });
        }

        const job = await Job.create({
            title,
            description,
            company,
            location,
            salary,
            requirements,
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
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single job by ID
// @route   GET /v1/api/jobs/:id
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a job
// @route   PUT /v1/api/jobs/update/:id
export const updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: "Job not found" });

        // Check if the user is the one who created the job
        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized to update this job" });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /v1/api/jobs/delete/:id
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: "Job not found" });

        // Authorization check
        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized to delete this job" });
        }

        await job.deleteOne();
        res.status(200).json({ message: "Job removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};