const mongoose = require('mongoose');
const Notification = require('./models/Notification');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-job-portal')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Check all notifications
const checkAllNotifications = async () => {
    try {
        console.log('🔍 Checking all notifications in database...');
        
        const allNotifications = await Notification.find({})
            .populate('recipient', 'name email role')
            .populate('sender', 'name email role')
            .populate('relatedJob', 'title')
            .sort({ createdAt: -1 });
        
        console.log(`📊 Total notifications: ${allNotifications.length}`);
        
        if (allNotifications.length === 0) {
            console.log('❌ No notifications found in database');
            return;
        }
        
        // Group by recipient role
        const recruiterNotifications = allNotifications.filter(n => n.recipient?.role === 'recruiter');
        const jobseekerNotifications = allNotifications.filter(n => n.recipient?.role === 'jobseeker');
        
        console.log(`👔 Recruiter notifications: ${recruiterNotifications.length}`);
        console.log(`👤 Jobseeker notifications: ${jobseekerNotifications.length}`);
        
        // Show recruiter notifications
        if (recruiterNotifications.length > 0) {
            console.log('\n👔 RECRUITER NOTIFICATIONS:');
            recruiterNotifications.forEach((notif, index) => {
                console.log(`${index + 1}. ${notif.title} - ${notif.message}`);
                console.log(`   Recipient: ${notif.recipient?.name} (${notif.recipient?.email})`);
                console.log(`   Sender: ${notif.sender?.name} (${notif.sender?.email})`);
                console.log(`   Read: ${notif.read} | Created: ${new Date(notif.createdAt).toLocaleString()}`);
                console.log('');
            });
        }
        
        // Show jobseeker notifications
        if (jobseekerNotifications.length > 0) {
            console.log('\n👤 JOBSEEKER NOTIFICATIONS:');
            jobseekerNotifications.forEach((notif, index) => {
                console.log(`${index + 1}. ${notif.title} - ${notif.message}`);
                console.log(`   Recipient: ${notif.recipient?.name} (${notif.recipient?.email})`);
                console.log(`   Sender: ${notif.sender?.name} (${notif.sender?.email})`);
                console.log(`   Read: ${notif.read} | Created: ${new Date(notif.createdAt).toLocaleString()}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking notifications:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkAllNotifications();
