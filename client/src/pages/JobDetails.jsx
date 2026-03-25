import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Calendar, Send, Users, ExternalLink } from "lucide-react";
import axios from "axios";
import ResumeUploadModal from "../components/ResumeUploadModal";

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [user, setUser] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);

    // Track where user came from
    const getBackPath = () => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const fromParam = searchParams.get('from');

        // Check if user came from My Applications page via URL parameter
        if (fromParam === 'my-applications') {
            return "/my-applications";
        }

        // Default to role-based dashboard
        if (currentUser?.role === "recruiter") {
            return "/dashboard/recruiter";
        } else {
            return "/dashboard/jobseeker";
        }
    };

    useEffect(() => {
        fetchJobDetails();
        // Load user data on component mount
        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);
    }, [id]);

    // Add effect to update user when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const userData = JSON.parse(localStorage.getItem("user"));
            setUser(userData);
        };

        // Listen for storage changes
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchJobDetails = async () => {
        try {
            try {
                const response = await axios.get(`http://localhost:5000/v1/api/jobs/${id}`);
                setJob(response.data);

                // Fetch company profile if job has a creator
                if (response.data.createdBy) {
                    fetchCompanyProfile(response.data.createdBy);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    const allJobsResponse = await axios.get(
                        'http://localhost:5000/v1/api/jobs/all?includeAllStatuses=true'
                    );
                    const foundJob = (allJobsResponse.data || []).find((j) => String(j._id) === String(id));
                    setJob(foundJob || null);

                    if (foundJob?.createdBy) {
                        fetchCompanyProfile(foundJob.createdBy);
                    }
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyProfile = async (recruiterId) => {
        try {
            const response = await axios.get(`http://localhost:5000/v1/api/recruiters/company-profile/${recruiterId}`);
            setCompanyProfile(response.data);
        } catch (error) {
            console.error("Error fetching company profile:", error);
            // Don't set error state, just log it
        }
    };

    const handleViewApplicants = () => {
        navigate(`/view-applicants/${id}`);
    };

    const handleApply = async () => {
        const token = localStorage.getItem("token");
        const currentUser = user || JSON.parse(localStorage.getItem("user"));

        console.log("=== APPLY DEBUG ===");
        console.log("Token:", token ? 'exists' : 'missing');
        console.log("Current user state:", user);
        console.log("Current user from localStorage:", JSON.parse(localStorage.getItem("user")));
        console.log("Has resume:", !!currentUser?.resume);
        console.log("Resume path:", currentUser?.resume);
        console.log("==================");

        if (!token) {
            navigate("/login");
            return;
        }

        if (currentUser?.role !== "jobseeker") {
            alert("Only jobseekers can apply for jobs");
            return;
        }

        // Check if user has resume
        if (!currentUser.resume) {
            console.log("No resume found, showing upload modal");
            setShowResumeModal(true);
            return;
        }

        setApplying(true);
        try {
            const response = await axios.post(`http://localhost:5000/v1/api/applications/apply`, {
                jobId: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Application response:", response.data);
            alert("Application submitted successfully!");
        } catch (error) {
            console.error("Error applying:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to apply for job");
        } finally {
            setApplying(false);
        }
    };

    const handleResumeUpload = async (file) => {
        setUploadingResume(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('resume', file);

            console.log('Uploading resume file:', file.name);
            console.log('Token:', token ? 'exists' : 'missing');

            const response = await axios.post(
                'http://localhost:5000/v1/api/resumes/upload-resume',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Upload response:', response.data);

            // IMPORTANT: Get fresh user data from backend after upload
            const userResponse = await axios.get('http://localhost:5000/v1/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update localStorage with fresh user data
            localStorage.setItem("user", JSON.stringify(userResponse.data));
            setUser(userResponse.data);

            console.log('Fresh user data from backend:', userResponse.data);

            alert('Resume uploaded successfully!');
            setShowResumeModal(false);

            // Directly apply after resume upload
            try {
                setApplying(true);
                const response = await axios.post(`http://localhost:5000/v1/api/applications/apply`, {
                    jobId: id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("Application response:", response.data);
                alert("Application submitted successfully!");
            } catch (error) {
                console.error("Error applying:", error.response?.data || error.message);
                alert(error.response?.data?.message || "Failed to apply for job");
            } finally {
                setApplying(false);
            }

        } catch (error) {
            console.error('Error uploading resume:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.status === 404) {
                alert('Server not running or endpoint not found. Please start the server.');
            } else if (error.response?.status === 500) {
                alert('Server error. Check server logs for details.');
            } else {
                alert(error.response?.data?.message || 'Failed to upload resume');
            }
            setShowResumeModal(false); // Close modal even on error
        } finally {
            setUploadingResume(false);
        }
    };

    const currentUser = user || JSON.parse(localStorage.getItem("user"));

    // Debug function to check user data
    const debugUserData = () => {
        const userData = JSON.parse(localStorage.getItem("user"));
        console.log('=== USER DATA DEBUG ===');
        console.log('User from localStorage:', userData);
        console.log('User from state:', user);
        console.log('Has resume:', !!userData?.resume);
        console.log('Resume path:', userData?.resume);
        console.log('====================');
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <h4 className="text-muted">Job not found</h4>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={() => navigate(getBackPath())}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-bottom">
                            <div className="d-flex align-items-center">
                                <button
                                    className="btn btn-outline-secondary me-3"
                                    onClick={() => navigate(getBackPath())}
                                >
                                    <ArrowLeft size={20} /> Back
                                </button>
                                <h5 className="mb-0 fw-bold">Job Details</h5>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <h2 className="fw-bold text-primary mb-3">{job.title}</h2>

                                <div className="d-flex flex-wrap gap-3 mb-4">
                                    <span className="badge bg-primary fs-6 px-3 py-2">
                                        {job.jobType}
                                    </span>
                                    <span className="text-muted d-flex align-items-center">
                                        <Briefcase size={16} className="me-1" />
                                        <button
                                            className="btn btn-link p-0 text-decoration-none text-muted fw-bold"
                                            onClick={() => navigate(`/company/${job.createdBy}`)}
                                        >
                                            {companyProfile?.companyName || job.company}
                                        </button>
                                    </span>
                                    <span className="text-muted d-flex align-items-center">
                                        <MapPin size={16} className="me-1" />
                                        {job.location}
                                    </span>
                                    {job.salary && (
                                        <span className="text-muted d-flex align-items-center">
                                            ₹
                                            {job.salary}
                                        </span>
                                    )}
                                </div>

                                <div className="text-muted mb-3 d-flex align-items-center">
                                    <Calendar size={16} className="me-2" />
                                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-bold mb-3">Job Description</h5>
                                <p className="text-muted" style={{ lineHeight: '1.6' }}>
                                    {job.description}
                                </p>
                            </div>

                            {job.requirements && job.requirements.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">Requirements</h5>
                                    <ul className="text-muted" style={{ lineHeight: '1.6' }}>
                                        {job.requirements.map((requirement, index) => (
                                            <li key={index} className="mb-2">{requirement}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="d-flex gap-3 pt-3 border-top">
                                {user?.role === "recruiter" ? (
                                    <button
                                        className="btn btn-primary d-flex align-items-center gap-2"
                                        onClick={handleViewApplicants}
                                    >
                                        <Users size={18} />
                                        View Applicants
                                    </button>
                                ) : searchParams.get('from') === 'my-applications' ? (
                                    <button
                                        className="btn btn-success d-flex align-items-center gap-2"
                                        disabled
                                    >
                                        <Send size={18} />
                                        Already Applied
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary d-flex align-items-center gap-2"
                                        onClick={handleApply}
                                        disabled={applying}
                                    >
                                        <Send size={18} />
                                        {applying ? "Applying..." : "Apply Now"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume Upload Modal */}
            <ResumeUploadModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                onUpload={handleResumeUpload}
                uploading={uploadingResume}
            />
        </div>
    );
};

export default JobDetails;
