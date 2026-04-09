import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Briefcase, MapPin, Calendar, Mail, Phone, CheckCircle, XCircle, Clock, CalendarCheck } from "lucide-react";
import axios from "axios";

const ViewApplicants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobDetails();
        fetchApplicants();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/v1/api/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJob(response.data);
        } catch (error) {
            console.error("Error fetching job details:", error);
        }
    };

    const fetchApplicants = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/v1/api/applications/job/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplicants(response.data);
        } catch (error) {
            console.error("Error fetching applicants:", error);
            console.error("Error response:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (applicationId, status) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/v1/api/applications/status/${applicationId}`, {
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh applicants list
            fetchApplicants();
            alert(`Application ${status} successfully!`);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update application status");
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading applicants...</p>
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
                        onClick={() => navigate("/dashboard/recruiter")}
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                    <h3 className="mb-0 fw-bold">Applicants for Job</h3>
                    <div></div>
                </div>

                {/* Job Details */}
                {job && (
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h4 className="fw-bold text-primary mb-2">{job.title}</h4>
                                    <p className="text-muted mb-3">{job.company}</p>
                                    <div className="d-flex gap-4 text-muted small">
                                        <div className="d-flex align-items-center gap-2">
                                            <MapPin size={16} className="text-primary" />
                                            {job.location}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Briefcase size={16} className="text-primary" />
                                            {job.jobType}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Calendar size={16} className="text-primary" />
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <h5 className="fw-bold text-primary">{applicants.length}</h5>
                                    <p className="text-muted small mb-0">Total Applicants</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applicants List */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                            <Users size={20} /> Applicants List
                        </h5>
                    </div>
                    <div className="card-body">
                        {applicants.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Applied Date</th>
                                            <th>Status</th>
                                            <th>Interview</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicants.map((application) => {
                                            const applicantId = typeof application.applicant === 'object' ? application.applicant?._id : application.applicant;
                                            return (
                                                <tr key={application._id}>
                                                    <td>
                                                        {applicantId ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0 text-decoration-none fw-bold text-start"
                                                                onClick={() => navigate(`/applicant/${applicantId}`)}
                                                            >
                                                                {application.applicant?.name || 'N/A'}
                                                            </button>
                                                        ) : (
                                                            <div className="fw-bold">
                                                                {application.applicant?.name || 'N/A'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Mail size={16} className="text-muted" />
                                                            {application.applicant?.email || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(application.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${application.status === 'approved' ? 'bg-success' :
                                                            application.status === 'rejected' ? 'bg-danger' :
                                                                application.status === 'interview_scheduled' ? 'bg-info' :
                                                                    application.status === 'shortlisted' ? 'bg-primary' :
                                                                        application.status === 'reviewed' ? 'bg-secondary' :
                                                                            'bg-warning'
                                                            }`}>
                                                            {application.status === 'interview_scheduled' ? 'Interview Scheduled' :
                                                                application.status === 'shortlisted' ? 'Shortlisted' :
                                                                    application.status === 'reviewed' ? 'Reviewed' :
                                                                        application.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {application.status === 'interview_scheduled' ? (
                                                            <div className="d-flex align-items-center gap-1 text-info">
                                                                <CalendarCheck size={16} />
                                                                <span className="small">Interview Scheduled</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">Not Scheduled</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => updateApplicationStatus(application._id, 'approved')}
                                                                disabled={application.status === 'approved' || application.status === 'interview_scheduled'}
                                                                title="Approve Application"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                                                disabled={application.status === 'rejected' || application.status === 'interview_scheduled'}
                                                                title="Reject Application"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <Users size={48} className="mb-3 opacity-25" />
                                <h5>No applicants yet</h5>
                                <p>When jobseekers apply for this position, they will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewApplicants;
