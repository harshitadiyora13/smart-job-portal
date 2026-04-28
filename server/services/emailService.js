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
    },

    welcome: {
        subject: 'Welcome to SmartHire! 🎉',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>Welcome to Your Career Journey!</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.name},</p>
                    <p>Welcome to SmartHire! We're thrilled to have you join our community of job seekers and employers.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Get Started:</h3>
                        <ul>
                            <li>Complete your profile</li>
                            <li>Upload your resume</li>
                            <li>Browse and apply for jobs</li>
                            <li>Set up job alerts</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${data.portalUrl}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>© 2024 SmartHire. All rights reserved.</p>
                </div>
            </div>
        `
    },

    job_alert: {
        subject: 'New Job Matches for You! 💼',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>New Job Opportunities</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.name},</p>
                    <p>We found ${data.jobCount} new job(s) matching your preferences!</p>
                    
                    ${data.jobs.map(job => `
                        <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea;">
                            <h3 style="margin: 0 0 10px 0;">${job.title}</h3>
                            <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                            <p style="margin: 5px 0;"><strong>Type:</strong> ${job.type}</p>
                            ${job.salary ? `<p style="margin: 5px 0;"><strong>Salary:</strong> ${job.salary}</p>` : ''}
                        </div>
                    `).join('')}
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${data.portalUrl}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View All Jobs
                        </a>
                    </div>
                    
                    <p>You can update your job alert preferences in your settings.</p>
                </div>
                <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>© 2024 SmartHire. All rights reserved.</p>
                </div>
            </div>
        `
    },

    password_reset: {
        subject: 'Password Reset Request - SmartHire',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>🎯 SmartHire</h1>
                    <h2>Password Reset</h2>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <p>Hello ${data.name},</p>
                    <p>You requested to reset your password. Click the button below to create a new password:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${data.resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
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

// Send welcome email to new user
const sendWelcomeEmail = async (user) => {
    try {
        const template = emailTemplates.welcome;
        if (!template) {
            console.log('Welcome email template not found');
            return false;
        }

        const emailData = {
            name: user.name,
            portalUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
        };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: template.subject,
            html: template.html(emailData)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

// Send job alert email
const sendJobAlertEmail = async (user, jobs) => {
    try {
        const template = emailTemplates.job_alert;
        if (!template) {
            console.log('Job alert template not found');
            return false;
        }

        const emailData = {
            name: user.name,
            jobCount: jobs.length,
            jobs: jobs.map(job => ({
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                salary: job.salary
            })),
            portalUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
        };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: template.subject,
            html: template.html(emailData)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Job alert sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Error sending job alert:', error);
        return false;
    }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const template = emailTemplates.password_reset;
        if (!template) {
            console.log('Password reset template not found');
            return false;
        }

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        const emailData = {
            name: user.name,
            resetUrl,
            portalUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
        };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: template.subject,
            html: template.html(emailData)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

module.exports = {
    sendEmailNotification,
    createNotification,
    sendWelcomeEmail,
    sendJobAlertEmail,
    sendPasswordResetEmail,
    emailTemplates
};
