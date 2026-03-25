import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Bell, Check, Trash2, Calendar, UserCheck, Briefcase } from "lucide-react";

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/v1/api/notifications", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                alert(error?.response?.data?.message || "Failed to fetch notifications");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case "application_received":
                return <Briefcase className="text-primary" size={16} />;
            case "application_status_update":
                return <UserCheck className="text-success" size={16} />;
            case "interview_scheduled":
            case "interview_reminder":
                return <Calendar className="text-primary" size={16} />;
            default:
                return <Bell className="text-muted" size={16} />;
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/v1/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
        } catch (error) {
            console.error("Error marking notification as read:", error);
            alert(error?.response?.data?.message || "Failed to mark as read");
        }
    };

    const handleDelete = async (notificationId) => {
        if (!window.confirm("Delete this notification?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/v1/api/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
            alert(error?.response?.data?.message || "Failed to delete notification");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/v1/api/notifications/read-all", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            alert(error?.response?.data?.message || "Failed to mark all as read");
        }
    };

    return (
        <div className="container py-5">
            <button
                onClick={() => navigate(-1)}
                className="btn btn-link text-decoration-none text-muted p-0 mb-4 d-flex align-items-center gap-2"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="card border-0 shadow-sm rounded-4 bg-white">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <Bell size={20} className="text-primary" />
                            <h3 className="fw-bold mb-0">Notifications</h3>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-5">
                            <Bell size={48} className="text-muted opacity-25" />
                            <h5 className="text-muted mt-3">No notifications yet</h5>
                        </div>
                    ) : (
                        <div className="list-group list-group-flush">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`list-group-item d-flex align-items-start justify-content-between gap-3 py-3 ${!n.read ? "bg-primary-subtle" : ""}`}
                                >
                                    <div className="d-flex gap-3">
                                        <div className="mt-1">{getNotificationIcon(n.type)}</div>
                                        <div>
                                            <div className={`fw-semibold ${!n.read ? "text-dark" : "text-muted"}`}>{n.title}</div>
                                            <div className="text-muted small">{n.message}</div>
                                            <div className="text-muted" style={{ fontSize: "12px" }}>
                                                {new Date(n.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        {!n.read && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleMarkAsRead(n._id)}
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(n._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
