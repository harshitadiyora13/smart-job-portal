const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email templates
const emailTemplates = {
    application_received: {
        subject: 'New Application Received - SmartHire',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>New Application Received</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.recruiterName},</p>
                    <p>You have received a new application for the position: <strong>${data.jobTitle}</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Applicant Details:</h3>
                        <p><strong>Name:</strong> ${data.applicantName}</p>
                        <p><strong>Email:</strong> ${data.applicantEmail}</p>
                        <p><strong>Applied Date:</strong> ${new Date(data.appliedDate).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${data.portalUrl}/dashboard/recruiter" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Application
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>© 2024 SmartHire. All rights reserved.</p>
                </div>
            </div>
        `
    },

    application_status_update: {
        subject: 'Application Status Update - SmartHire',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>Application Status Update</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.applicantName},</p>
                    <p>Your application status has been updated for the position: <strong>${data.jobTitle}</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Application Details:</h3>
                        <p><strong>Company:</strong> ${data.companyName}</p>
                        <p><strong>Position:</strong> ${data.jobTitle}</p>
                        <p><strong>New Status:</strong> <span style="background: ${data.statusColor}; color: white; padding: 5px 10px; border-radius: 3px;">${data.status}</span></p>
                        ${data.interviewDate ? `<p><strong>Interview Date:</strong> ${new Date(data.interviewDate).toLocaleDateString()}</p>` : ''}
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${data.portalUrl}/dashboard/jobseeker" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Application
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>© 2024 SmartHire. All rights reserved.</p>
                </div>
            </div>
        `
    },

    interview_scheduled: {
        subject: 'Interview Scheduled - SmartHire',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>Interview Scheduled</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.applicantName},</p>
                    <p>Your interview has been scheduled for the position: <strong>${data.jobTitle}</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Interview Details:</h3>
                        <p><strong>Company:</strong> ${data.companyName}</p>
                        <p><strong>Position:</strong> ${data.jobTitle}</p>
                        <p><strong>Date:</strong> ${new Date(data.interviewDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${data.interviewTime}</p>
                        <p><strong>Type:</strong> ${data.interviewType}</p>
                        ${data.interviewLocation ? `<p><strong>Location:</strong> ${data.interviewLocation}</p>` : ''}
                        ${data.interviewNotes ? `<p><strong>Notes:</strong> ${data.interviewNotes}</p>` : ''}
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${data.portalUrl}/dashboard/jobseeker" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Interview Details
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>© 2024 SmartHire. All rights reserved.</p>
                </div>
            </div>
        `
    },

    interview_reminder: {
        subject: 'Interview Reminder - SmartHire',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>📅 Interview Reminder</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.applicantName},</p>
                    <p>This is a friendly reminder about your upcoming interview:</p>
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Interview Details:</h3>
                        <p><strong>Company:</strong> ${data.companyName}</p>
                        <p><strong>Position:</strong> ${data.jobTitle}</p>
                        <p><strong>Date:</strong> ${new Date(data.interviewDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${data.interviewTime}</p>
                        <p><strong>Type:</strong> ${data.interviewType}</p>
                        ${data.interviewLocation ? `<p><strong>Location:</strong> ${data.interviewLocation}</p>` : ''}
                    </div>
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>💡 Tips:</strong></p>
                        <ul>
                            <li>Prepare questions about the company and role</li>
                            <li>Research the company background</li>
                            <li>Test your technical setup if it's a virtual interview</li>
                            <li>Arrive 10-15 minutes early</li>
                        </ul>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>© 2024 SmartHire. All rights reserved.</p>
                </div>
            </div>
        `
    }
};

// Send email notification
const sendEmailNotification = async (notification) => {
    try {
        // Get recipient details
        const recipient = await User.findById(notification.recipient);
        if (!recipient || !recipient.email) {
            console.log('Recipient not found or no email');
            return false;
        }

        // Get template for notification type
        const template = emailTemplates[notification.type];
        if (!template) {
            console.log('No email template found for type:', notification.type);
            return false;
        }

        // Prepare email data
        const emailData = {
            recipientName: recipient.name,
            portalUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
            ...notification.relatedJob ? { jobTitle: notification.relatedJob.title } : {},
            ...notification.relatedApplication ? { appliedDate: notification.relatedApplication.createdAt } : {},
            ...notification.relatedInterview ? {
                interviewDate: notification.relatedInterview.date,
                interviewTime: notification.relatedInterview.time,
                interviewType: notification.relatedInterview.type,
                interviewLocation: notification.relatedInterview.location,
                interviewNotes: notification.relatedInterview.notes
            } : {}
        };

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: template.subject,
            html: template.html(emailData)
        };

        await transporter.sendMail(mailOptions);

        // Mark notification as email sent
        notification.emailSent = true;
        await notification.save();

        console.log(`Email sent successfully to ${recipient.email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Create and send notification
const createNotification = async (notificationData) => {
    try {
        console.log('Creating notification with data:', notificationData);
        const notification = new Notification(notificationData);
        await notification.save();
        console.log('Notification saved successfully with ID:', notification._id);

        // Send email notification
        await sendEmailNotification(notification);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

module.exports = {
    sendEmailNotification,
    createNotification,
    emailTemplates
};
