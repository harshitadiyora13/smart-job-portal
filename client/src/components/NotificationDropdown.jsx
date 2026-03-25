import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Mail, Calendar, UserCheck, Briefcase } from 'lucide-react';
import axios from 'axios';

const NotificationDropdown = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Set up polling for new notifications
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/v1/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/v1/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const count = response.data.count || 0;
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
            setUnreadCount(0);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/v1/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/v1/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/v1/api/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            const deletedNotification = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
            if (!deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'application_received':
                return <Briefcase className="text-blue-500" size={16} />;
            case 'application_status_update':
                return <UserCheck className="text-green-500" size={16} />;
            case 'interview_scheduled':
                return <Calendar className="text-purple-500" size={16} />;
            case 'interview_reminder':
                return <Calendar className="text-orange-500" size={16} />;
            default:
                return <Bell className="text-gray-500" size={16} />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'application_received':
                return 'border-blue-200 bg-blue-50';
            case 'application_status_update':
                return 'border-green-200 bg-green-50';
            case 'interview_scheduled':
                return 'border-purple-200 bg-purple-50';
            case 'interview_reminder':
                return 'border-orange-200 bg-orange-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-outline-warning shadow-sm"
                style={{ color: '#EAB308', borderColor: '#EAB308' }}
            >
                <Bell size={18} style={{ color: '#EAB308' }} />
                {/* <span className="d-none d-md-inline">Notifications</span> */}
                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge bg-danger text-white rounded-pill animate-pulse"
                        style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            zIndex: 10,
                            backgroundColor: '#EF4444'
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={48} className="mx-auto mb-2 opacity-20" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? getNotificationColor(notification.type) : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-normal'} text-gray-800`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification._id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    // Navigate to full notifications page
                                    setIsOpen(false);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
