import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Calendar, CheckCircle, XCircle, Clock, Eye, Trash2 } from "lucide-react";
import axios from "axios";

const MyApplications = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyApplications();
    }, []);

    const fetchMyApplications = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/v1/api/applications/my-applications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteApplication = async (applicationId, jobTitle, status) => {
        // Check if application can be deleted
        if (!canDeleteApplication(status)) {
            alert(`Cannot delete application with status "${status}". Applications can only be deleted when status is pending, reviewed, or shortlisted.`);
            return;
        }

        if (window.confirm(`Are you sure you want to cancel your application for "${jobTitle}"?`)) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:5000/v1/api/applications/${applicationId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Refresh the applications list
                fetchMyApplications();

                // Show success message
                alert("Application cancelled successfully!");
            } catch (error) {
                console.error("Error deleting application:", error);
                const errorMessage = error.response?.data?.message || "Failed to cancel application";
                alert(errorMessage);
            }
        }
    };

    const canDeleteApplication = (status) => {
        const deletableStatuses = ['pending', 'reviewed', 'shortlisted'];
        const canDelete = deletableStatuses.includes(status);
        return canDelete;
    };

    const getDeleteButtonTitle = (status) => {
        if (canDeleteApplication(status)) {
            return "Cancel Application";
        } else {
            return `Cannot delete application with status "${status}". Only pending, reviewed, or shortlisted applications can be cancelled.`;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-warning', icon: Clock, text: 'Pending' },
            shortlisted: { color: 'bg-info', icon: Clock, text: 'Shortlisted' },
            approved: { color: 'bg-success', icon: CheckCircle, text: 'Approved' },
            rejected: { color: 'bg-danger', icon: XCircle, text: 'Rejected' },
            interview_scheduled: { color: 'bg-primary', icon: Calendar, text: 'Interview Scheduled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`badge rounded-pill ${config.color} d-flex align-items-center gap-1 px-3`}>
                <Icon size={14} />
                {config.text}
            </span>
        );
    };

    const getStatusTimeline = (status) => {
        const steps = [
            { key: 'pending', label: 'Applied' },
            { key: 'reviewed', label: 'Reviewed' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'interview_scheduled', label: 'Interview' },
            { key: 'approved', label: 'Selected' }
        ];

        if (status === 'rejected') {
            return { steps, currentIndex: 0, isRejected: true };
        }

        const indexByStatus = {
            pending: 0,
            reviewed: 1,
            accepted: 1,
            shortlisted: 2,
            interview_scheduled: 3,
            approved: 4
        };

        const currentIndex = Number.isInteger(indexByStatus[status]) ? indexByStatus[status] : 0;
        return { steps, currentIndex, isRejected: false };
    };

    const renderStatusTimeline = (status) => {
        const { steps, currentIndex, isRejected } = getStatusTimeline(status);

        const activeColor = isRejected ? '#dc3545' : '#0d6efd';
        const inactiveColor = '#dee2e6';

        return (
            <div className="mt-2" style={{ minWidth: 180 }}>
                <div className="d-flex align-items-center">
                    {steps.map((step, idx) => {
                        const isDone = !isRejected && idx <= currentIndex;
                        const isActive = !isRejected && idx === currentIndex;

                        const dotBg = isRejected ? '#dc3545' : isDone ? activeColor : inactiveColor;
                        const dotBorder = isRejected ? '#dc3545' : isDone ? activeColor : inactiveColor;
                        const labelColor = isRejected ? '#dc3545' : isActive ? '#0d6efd' : '#6c757d';

                        return (
                            <React.Fragment key={step.key}>
                                <div className="d-flex flex-column align-items-center" style={{ width: 44 }}>
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            backgroundColor: dotBg,
                                            border: `2px solid ${dotBorder}`
                                        }}
                                    />
                                    <small className="mt-1" style={{ fontSize: 10, color: labelColor, textAlign: 'center' }}>
                                        {step.label}
                                    </small>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        style={{
                                            height: 2,
                                            width: 26,
                                            backgroundColor: isRejected ? '#dc3545' : idx < currentIndex ? activeColor : inactiveColor
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                {isRejected && (
                    <small className="d-block mt-1" style={{ fontSize: 10, color: '#dc3545' }}>
                        Rejected
                    </small>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading your applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="container">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={() => navigate("/dashboard/jobseeker")}
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                    <h3 className="mb-0 fw-bold">My Applications</h3>
                    <div></div>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-5">
                    <div className="col">
                        <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
                            <h4 className="fw-bold text-primary mb-1">{applications.length}</h4>
                            <p className="text-muted small mb-0">Total</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
                            <h4 className="fw-bold text-warning mb-1">
                                {applications.filter(app => app.status === 'pending').length}
                            </h4>
                            <p className="text-muted small mb-0">Pending</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
                            <h4 className="fw-bold text-info mb-1">
                                {applications.filter(app => app.status === 'interview_scheduled').length}
                            </h4>
                            <p className="text-muted small mb-0">Interview</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
                            <h4 className="fw-bold text-success mb-1">
                                {applications.filter(app => app.status === 'approved').length}
                            </h4>
                            <p className="text-muted small mb-0">Approved</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
                            <h4 className="fw-bold text-danger mb-1">
                                {applications.filter(app => app.status === 'rejected').length}
                            </h4>
                            <p className="text-muted small mb-0">Rejected</p>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">Application History</h5>
                    </div>
                    <div className="card-body">
                        {applications.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Job Details</th>
                                            <th>Company</th>
                                            <th>Location</th>
                                            <th>Applied Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((application) => (
                                            <tr key={application._id}>
                                                <td>
                                                    <div className="fw-bold text-primary">
                                                        {application.job?.title || 'Unknown Position'}
                                                    </div>
                                                    <small className="text-muted">
                                                        {application.job?.jobType || 'Full-time'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Briefcase size={16} className="text-muted" />
                                                        {application.job?.company || 'Unknown Company'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <MapPin size={16} className="text-muted" />
                                                        {application.job?.location || 'Unknown Location'}
                                                    </div>
                                                </td>
                                                <td>
                                                    {new Date(application.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    {getStatusBadge(application.status)}
                                                    {renderStatusTimeline(application.status)}
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => navigate(`/job/${application.job?._id}?from=my-applications`)}
                                                            title="View Job Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteApplication(application._id, application.job?.title, application.status)}
                                                            title={getDeleteButtonTitle(application.status)}
                                                            disabled={!canDeleteApplication(application.status)}
                                                            style={{ opacity: canDeleteApplication(application.status) ? 1 : 0.5 }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <Briefcase size={48} className="mb-3 opacity-25" />
                                <h5>No applications yet</h5>
                                <p>Start applying for jobs to see your application history here.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate("/dashboard/jobseeker")}
                                >
                                    Browse Jobs
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
