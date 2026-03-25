const mongoose = require('mongoose');
const Notification = require('./models/Notification');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-job-portal')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Check all notifications in the database
const checkNotifications = async () => {
    try {
        console.log('\n=== Checking All Notifications in Database ===');
        
        // Get all notifications
        const allNotifications = await Notification.find({})
            .populate('recipient', 'name email role')
            .populate('sender', 'name email role')
            .populate('relatedJob', 'title')
            .sort({ createdAt: -1 });
        
        console.log(`Total notifications in database: ${allNotifications.length}`);
        
        if (allNotifications.length === 0) {
            console.log('❌ No notifications found in database');
        } else {
            allNotifications.forEach((notif, index) => {
                console.log(`\n--- Notification ${index + 1} ---`);
                console.log('Type:', notif.type);
                console.log('Title:', notif.title);
                console.log('Message:', notif.message);
                console.log('Recipient:', notif.recipient?.name, `(${notif.recipient?.role})`);
                console.log('Sender:', notif.sender?.name, `(${notif.sender?.role})`);
                console.log('Read:', notif.read);
                console.log('Email Sent:', notif.emailSent);
                console.log('Created:', new Date(notif.createdAt).toLocaleString());
                if (notif.relatedJob) {
                    console.log('Related Job:', notif.relatedJob.title);
                }
            });
        }
        
        // Check notifications by user type
        console.log('\n=== Notifications by User Type ===');
        
        const recruiterNotifications = await Notification.find({})
            .populate('recipient', 'role')
            .populate('sender', 'role')
            .then(notifs => notifs.filter(n => n.recipient?.role === 'recruiter'));
        
        const jobseekerNotifications = await Notification.find({})
            .populate('recipient', 'role')
            .populate('sender', 'role')
            .then(notifs => notifs.filter(n => n.recipient?.role === 'jobseeker'));
        
        console.log(`Recruiter notifications: ${recruiterNotifications.length}`);
        console.log(`Jobseeker notifications: ${jobseekerNotifications.length}`);
        
        // Show recent recruiter notifications
        if (recruiterNotifications.length > 0) {
            console.log('\n=== Recent Recruiter Notifications ===');
            recruiterNotifications.slice(0, 3).forEach((notif, index) => {
                console.log(`${index + 1}. ${notif.title} - ${notif.recipient?.name}`);
            });
        }
        
    } catch (error) {
        console.error('Error checking notifications:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkNotifications();
