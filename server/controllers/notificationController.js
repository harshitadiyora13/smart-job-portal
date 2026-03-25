const Notification = require('../models/Notification');
const { createNotification } = require('../services/emailService');

// @desc    Get all notifications for a user
// @route   GET /v1/api/notifications
const getNotifications = async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user._id, req.user.name);
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name email')
            .populate('relatedJob', 'title company')
            .populate('relatedApplication')
            .populate('relatedInterview')
            .sort({ createdAt: -1 });

        console.log('Found notifications:', notifications.length, 'for user:', req.user.name);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /v1/api/notifications/:id/read
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /v1/api/notifications/read-all
const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /v1/api/notifications/:id
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unread notification count
// @route   GET /v1/api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    try {
        console.log('Getting unread count for user:', req.user._id, req.user.name);
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        console.log('Unread count for user:', req.user.name, ':', count);
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to create application received notification
const createApplicationReceivedNotification = async (application) => {
    try {
        console.log('Creating application received notification for:', application._id);
        const Job = require('../models/Job');
        const job = await Job.findById(application.job).populate('createdBy');

        console.log('Job found:', job.title, 'Recruiter:', job.createdBy?.name || job.createdBy?._id);

        await createNotification({
            recipient: job.createdBy._id,
            sender: application.applicant,
            type: 'application_received',
            title: 'New Application Received',
            message: `New application received for ${job.title}`,
            relatedJob: job._id,
            relatedApplication: application._id
        });

        console.log('Notification created successfully for recruiter:', job.createdBy._id);
    } catch (error) {
        console.error('Error creating application received notification:', error);
    }
};

// Helper function to create application status update notification
const createApplicationStatusUpdateNotification = async (application, oldStatus, newStatus) => {
    try {
        const Job = require('../models/Job');
        const job = await Job.findById(application.job);

        await createNotification({
            recipient: application.applicant,
            sender: job.createdBy,
            type: 'application_status_update',
            title: 'Application Status Updated',
            message: `Your application for ${job.title} status has been updated to ${newStatus}`,
            relatedJob: job._id,
            relatedApplication: application._id
        });
    } catch (error) {
        console.error('Error creating application status update notification:', error);
    }
};

// Helper function to create interview scheduled notification
const createInterviewScheduledNotification = async (interview) => {
    try {
        const Application = require('../models/Application');
        const Job = require('../models/Job');
        const application = await Application.findById(interview.applicationId);
        const job = await Job.findById(application.job);

        await createNotification({
            recipient: application.applicant,
            sender: job.createdBy,
            type: 'interview_scheduled',
            title: 'Interview Scheduled',
            message: `Interview scheduled for ${job.title} on ${new Date(interview.date).toLocaleDateString()}`,
            relatedJob: job._id,
            relatedApplication: application._id,
            relatedInterview: interview._id
        });
    } catch (error) {
        console.error('Error creating interview scheduled notification:', error);
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
    createApplicationReceivedNotification,
    createApplicationStatusUpdateNotification,
    createInterviewScheduledNotification
};