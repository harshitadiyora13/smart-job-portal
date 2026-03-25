const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            'application_received',
            'application_status_update',
            'interview_scheduled',
            'interview_reminder',
            'job_posted',
            'profile_update',
            'application',
            'interview',
            'job_update'
        ],
        default: 'application'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    relatedApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    relatedInterview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    },
    read: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;