import Application from '../models/Application.js';
import Job from '../models/Job.js';

// @desc    Apply for a job
// @route   POST /v1/api/applications/apply/:id
export const applyToJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user._id;

        // 1. Check if job exists
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // 2. Check if already applied
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }

        // 3. Create application (For now, we use a placeholder for resume URL)
        const application = await Application.create({
            job: jobId,
            applicant: userId,
            resume: req.body.resume || "placeholder_link.pdf" 
        });

        res.status(201).json({ message: "Applied successfully", application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applications for a specific job (Recruiter only)
// @route   GET /v1/api/applications/job/:id
export const getJobApplications = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.id })
            .populate('applicant', 'name email profile')
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Application Status
// @route   PUT /v1/api/applications/status/:id
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // Find application and populate job to check recruiter ownership
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) return res.status(404).json({ message: "Application not found" });

        // Ensure only the recruiter who posted the job can change the status
        if (application.job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.status = status;
        await application.save();

        res.status(200).json({ message: "Status updated successfully", application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};