import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import { PlusCircle, LogOut, Briefcase, Users, Calendar, Eye, Edit, Trash2, Building2, MoreVertical, Bell } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [jobs, setJobs] = useState([]);
    const [totalApplicants, setTotalApplicants] = useState(0);
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState([]);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [interviewForm, setInterviewForm] = useState({
        jobId: '',
        applicantId: '',
        date: '',
        time: '',
        type: 'video',
        notes: ''
    });
    const [jobApplicants, setJobApplicants] = useState([]);
    const [jobApplicantsLoading, setJobApplicantsLoading] = useState(false);
    const [disabledApplicantIds, setDisabledApplicantIds] = useState(new Set());
    const [applicantStatusById, setApplicantStatusById] = useState({});

    useEffect(() => {
        fetchMyJobs();
        fetchTotalApplicants();
        fetchInterviews();
        fetchCompanyProfile();
    }, []);

    const fetchMyJobs = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/v1/api/jobs/my-jobs", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setJobs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalApplicants = async () => {
        try {
            const token = localStorage.getItem("token");
            const jobsResponse = await axios.get("http://localhost:5000/v1/api/jobs/my-jobs", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const myJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
            const jobIds = myJobs.map((job) => job._id);
            if (jobIds.length === 0) {
                setTotalApplicants(0);
                return;
            }
            const applicationsResponse = await axios.post(`http://localhost:5000/v1/api/applications/count`, {
                jobIds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTotalApplicants(applicationsResponse.data.count || 0);
        } catch (error) {
            console.error("Error fetching total applicants:", error);
            setTotalApplicants(0);
        }
    };

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/v1/api/interviews", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterviews(response.data || []);
        } catch (error) {
            console.error("Error fetching interviews:", error);
            setInterviews([]);
        }
    };

    const fetchCompanyProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/v1/api/recruiters/company-profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanyProfile(response.data);
        } catch (error) {
            console.error("Error fetching company profile:", error);
            // Don't set error state, just log it
        }
    };

    const fetchJobApplicants = async (jobId) => {
        try {
            setJobApplicantsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/v1/api/applications/job/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const applications = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.applications)
                    ? response.data.applications
                    : [];

            console.log('Schedule interview: applications response', { jobId, applicationsCount: applications.length, sample: applications?.[0] });

            const applicants = applications.map((a) => a?.applicant).filter(Boolean);
            const statusMap = applications.reduce((acc, a) => {
                const applicantId = typeof a?.applicant === 'object' ? a?.applicant?._id : a?.applicant;
                if (applicantId) acc[applicantId] = a?.status;
                return acc;
            }, {});

            const disabled = new Set(
                interviews
                    .filter((i) => {
                        const interviewJobId = typeof i?.jobId === 'object' ? i?.jobId?._id : i?.jobId;
                        return interviewJobId === jobId && ['scheduled', 'completed'].includes(i?.status);
                    })
                    .map((i) => (typeof i?.applicantId === 'object' ? i?.applicantId?._id : i?.applicantId))
                    .filter(Boolean)
            );
            const eligibleStatuses = new Set(['pending', 'reviewed', 'accepted', 'approved', 'shortlisted', 'interview_scheduled']);
            Object.entries(statusMap).forEach(([applicantId, status]) => {
                if (status && !eligibleStatuses.has(status)) {
                    disabled.add(applicantId);
                }
            });
            setJobApplicants(applicants);
            setDisabledApplicantIds(disabled);
            setApplicantStatusById(statusMap);
        } catch (error) {
            console.error("Error fetching job applicants:", error);
            console.error("Error response:", error.response?.data);
            setJobApplicants([]);
            setDisabledApplicantIds(new Set());
            setApplicantStatusById({});
        } finally {
            setJobApplicantsLoading(false);
        }
    };

    const handleScheduleInterview = (job) => {
        setSelectedJob(job);
        fetchJobApplicants(job._id);
        setInterviewForm({
            ...interviewForm,
            jobId: job._id,
            applicantId: ''
        });
        setShowInterviewModal(true);
    };

    const handleInterviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const scheduledAt = new Date(`${interviewForm.date}T${interviewForm.time}`);
            if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
                toast.error('Interview cannot be scheduled in the past');
                return;
            }

            // Time validation: Only allow between 9:00 AM and 5:00 PM
            const hours = scheduledAt.getHours();
            if (hours < 9 || hours >= 17) {
                toast.error('Interviews can only be scheduled between 9:00 AM and 5:00 PM');
                return;
            }

            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/v1/api/interviews/schedule", interviewForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Interview scheduled successfully!");
            setShowInterviewModal(false);
            setInterviewForm({
                jobId: '',
                applicantId: '',
                date: '',
                time: '',
                type: 'video',
                notes: ''
            });
            fetchInterviews();
        } catch (error) {
            console.error("Error scheduling interview:", error);
            const errorMessage = error.response?.data?.message || "Failed to schedule interview";
            toast.error(errorMessage);
        }
    };

    const handleDeleteInterview = async (interviewId) => {
        if (window.confirm("Are you sure you want to cancel this interview?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:5000/v1/api/interviews/${interviewId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Interview cancelled successfully!");
                fetchInterviews();
            } catch (error) {
                console.error("Error cancelling interview:", error);
                toast.error("Failed to cancel interview");
            }
        }
    };

    const handleDelete = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job? This will also delete all related interviews and applications.")) {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.delete(`http://localhost:5000/v1/api/jobs/delete/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { deletedInterviews, deletedApplications, deletedNotifications } = response.data;
                let message = "Job deleted successfully!";
                if (deletedInterviews > 0 || deletedApplications > 0 || deletedNotifications > 0) {
                    message += `\n\nAlso deleted:\n- ${deletedInterviews} interview(s)\n- ${deletedApplications} application(s)\n- ${deletedNotifications} notification(s)`;
                }

                toast.success(message);
                fetchMyJobs();
                fetchInterviews(); // Refresh interviews list too
            } catch (error) {
                console.error("Error deleting job:", error);
                const errorMessage = error.response?.data?.message || "Failed to delete job";
                toast.error(errorMessage);
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-3">
            <div className="container">
                {/* --- HEADER --- */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-primary mb-1">Welcome, {user?.name || "Recruiter"}</h2>
                        <p className="text-muted mb-0">Manage your job listings and track applicants.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <DarkModeToggle />
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                title="Menu"
                            >
                                <MoreVertical size={18} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                    <button className="dropdown-item d-flex align-items-center gap-2" type="button" onClick={() => navigate("/notifications")}>
                                        <Bell size={16} /> Notifications
                                    </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" type="button" onClick={handleLogout}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- STATS CARDS --- */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-primary text-white p-3 rounded-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1 opacity-75 fw-bold">Active Jobs</p>
                                    <h3 className="mb-0 fw-bold">{jobs.length}</h3>
                                </div>
                                <Briefcase size={32} className="opacity-25" />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-dark text-white p-3 rounded-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1 opacity-75 fw-bold">Total Applicants</p>
                                    <h3 className="mb-0 fw-bold">{totalApplicants}</h3>
                                </div>
                                <Users size={32} className="opacity-25" />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-white p-3 rounded-3 border-start border-primary border-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1 text-muted fw-bold">Interviews</p>
                                    <h3 className="mb-0 fw-bold text-dark">{interviews.length}</h3>
                                </div>
                                <Calendar size={32} className="opacity-25 text-muted" />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-white p-3 rounded-3 border-start border-primary border-3" >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1 text-muted fw-bold">Company Profile</p>
                                    <button
                                        className="btn btn-sm btn-light rounded-pill px-3 py-1 fw-bold"
                                        onClick={() => companyProfile ? navigate(`/company/${user._id}`) : navigate("/company-onboarding")}
                                    >
                                        {companyProfile ? 'See Profile' : 'Setup Now'}
                                    </button>
                                </div>
                                <Building2 size={32} className="opacity-25" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- JOB LISTINGS TABLE --- */}
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                        <h5 className="mb-0 fw-bold">Your Job Postings</h5>
                        <button className="btn d-flex align-items-center bg-primary gap-2 shadow-sm text-white px-3" onClick={() => navigate("/post-job")}>+ New Job</button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Job Title</th>
                                    <th>Company</th>
                                    <th>Location</th>
                                    <th>Type</th>
                                    <th>Posted Date</th>
                                    <th className="text-center pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-3">Loading jobs...</td></tr>
                                ) : jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <tr key={job._id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{job.title}</div>
                                                <small className="text-muted">{job.description?.substring(0, 30)}...</small>
                                            </td>
                                            <td>{job.company}</td>
                                            <td>{job.location}</td>
                                            <td>
                                                <span className={`badge rounded-pill ${job.jobType === 'Full-time' ? 'bg-primary' : 'bg-info'} px-3`}>
                                                    {job.jobType}
                                                </span>
                                            </td>
                                            <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                            <td className="text-center pe-4">
                                                <div className="btn-group border rounded-3 overflow-hidden shadow-sm">
                                                    <button className="btn btn-white text-primary border-end" title="View" onClick={() => navigate(`/job/${job._id}`)}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="btn btn-white text-secondary border-end" title="Edit" onClick={() => navigate(`/edit-job/${job._id}`)}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button className="btn btn-white text-info border-end" title="Schedule Interview" onClick={() => handleScheduleInterview(job)}>
                                                        <Calendar size={18} />
                                                    </button>
                                                    <button className="btn btn-white text-danger" title="Delete" onClick={() => handleDelete(job._id)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-3 text-muted">
                                            No jobs found. Start by posting your first job!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- INTERVIEWS LIST --- */}
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden mt-4">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                        <h5 className="mb-0 fw-bold">Scheduled Interviews</h5>
                        <span className="badge bg-primary rounded-pill px-3">{interviews.length}</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Job Title</th>
                                    <th>Applicant</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th className="text-center pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interviews.length > 0 ? (
                                    interviews.map((interview) => (
                                        <tr key={interview._id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{interview.jobId?.title || 'Unknown Job'}</div>
                                            </td>
                                            <td>
                                                {(() => {
                                                    const applicant = interview?.applicantId;
                                                    const applicantId = typeof applicant === 'object' ? applicant?._id : applicant;
                                                    const label = applicant?.name || applicant?.email || 'Unknown Applicant';
                                                    if (!applicantId) return label;
                                                    return (
                                                        <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => navigate(`/applicant/${applicantId}`)}>
                                                            {label}
                                                        </button>
                                                    );
                                                })()}
                                            </td>
                                            <td>{interview.date ? new Date(interview.date).toLocaleDateString() : 'Not set'}</td>
                                            <td>{interview.time || 'Not set'}</td>
                                            <td>
                                                <span className={`badge rounded-pill ${interview.type === 'video' ? 'bg-info' : interview.type === 'onsite' ? 'bg-success' : 'bg-warning'} px-3`}>
                                                    {interview.type === 'video' ? 'Online' : interview.type === 'onsite' ? 'In-Person' : 'Phone'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill ${interview.status === 'scheduled' ? 'bg-primary' : interview.status === 'completed' ? 'bg-success' : 'bg-secondary'} px-3`}>
                                                    {interview.status || 'scheduled'}
                                                </span>
                                            </td>
                                            <td className="text-center pe-4">
                                                <div className="btn-group border rounded-3 overflow-hidden shadow-sm">
                                                    <button className="btn btn-white text-danger" title="Cancel Interview" onClick={() => handleDeleteInterview(interview._id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            No interviews scheduled yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- INTERVIEW SCHEDULING MODAL --- */}
                {showInterviewModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header py-3">
                                    <h5 className="modal-title">Schedule Interview</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowInterviewModal(false)}></button>
                                </div>
                                <form onSubmit={handleInterviewSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Job</label>
                                            <input type="text" className="form-control" value={selectedJob?.title || ''} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Applicant</label>
                                            <select className="form-select" value={interviewForm.applicantId} onChange={(e) => setInterviewForm({ ...interviewForm, applicantId: e.target.value })} required>
                                                <option value="">Select an applicant</option>
                                                {jobApplicantsLoading && (
                                                    <option value="" disabled>
                                                        Loading applicants...
                                                    </option>
                                                )}
                                                {jobApplicants.map((a) => {
                                                    const applicantId = typeof a === 'object' ? a?._id : a;
                                                    const isDisabled = disabledApplicantIds.has(applicantId);
                                                    const status = applicantStatusById?.[applicantId];
                                                    return (
                                                        <option key={applicantId} value={applicantId} disabled={isDisabled}>
                                                            {a?.name} ({a?.email}){isDisabled ? ` - ${status === 'interview_scheduled' ? 'Interview already scheduled' : 'Not eligible'}` : ''}
                                                        </option>
                                                    );
                                                })}
                                                {!jobApplicantsLoading && jobApplicants.length === 0 && (
                                                    <option value="" disabled>
                                                        No applicants found for this job
                                                    </option>
                                                )}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Interview Type</label>
                                            <select className="form-select" value={interviewForm.type} onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}>
                                                <option value="video">Online/Video</option>
                                                <option value="onsite">In-Person</option>
                                                <option value="phone">Phone</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Date</label>
                                            <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} value={interviewForm.date} onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Time</label>
                                            <input type="time" className="form-control" value={interviewForm.time} onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })} min="09:00" max="17:00" required />
                                            <small className="text-muted">Interviews can only be scheduled between 9:00 AM and 5:00 PM</small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Notes</label>
                                            <textarea className="form-control" rows="3" placeholder="Additional notes for candidate" value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer py-3">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary text-white border-0" style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>Schedule Interview</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;