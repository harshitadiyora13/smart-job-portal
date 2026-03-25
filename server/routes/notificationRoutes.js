const express = require('express');
const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount
} = require('../controllers/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get all notifications for the logged-in user
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark a specific notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;