import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import { ArrowLeft, Bookmark, Briefcase, MapPin, Send } from "lucide-react";

const SavedJobs = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);

    const token = useMemo(() => localStorage.getItem("token"), []);

    const fetchSavedJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/v1/api/users/saved-jobs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data?.savedJobs || []);
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
            toast.error(error?.response?.data?.message || "Failed to load saved jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchSavedJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleUnsave = async (jobId) => {
        try {
            await axios.post(`http://localhost:5000/v1/api/users/saved-jobs/${jobId}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs((prev) => prev.filter((j) => j._id !== jobId));
        } catch (error) {
            console.error("Error unsaving job:", error);
            toast.error(error?.response?.data?.message || "Failed to unsave job");
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
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <Bookmark size={20} className="text-primary" />
                        <h3 className="fw-bold mb-0">Saved Jobs</h3>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Loading saved jobs...</p>
                        </div>
                    ) : jobs.length > 0 ? (
                        <div className="row g-4">
                            {jobs.map((job) => (
                                <div className="col-md-6 col-lg-4" key={job._id}>
                                    <div className="card h-100 border-0 shadow-sm rounded-4 p-3">
                                        <div className="card-body d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-primary text-white p-2 rounded-3">
                                                    <Briefcase size={22} />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleUnsave(job._id)}
                                                >
                                                    Unsave
                                                </button>
                                            </div>

                                            <h5 className="card-title fw-bold mb-1">{job.title}</h5>
                                            <p className="text-muted mb-3">{job.company}</p>

                                            <div className="mt-auto">
                                                <div className="d-flex align-items-center text-muted small mb-4">
                                                    <MapPin size={16} className="me-2 text-primary" /> {job.location}
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/job/${job._id}`)}
                                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold text-white"
                                                    style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
                                                >
                                                    View Details <Send size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <Bookmark size={48} className="text-muted opacity-25" />
                            <h5 className="text-muted mt-3">No saved jobs yet</h5>
                            <p className="text-muted">Browse jobs and save the ones you like.</p>
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate("/dashboard/jobseeker")}
                            >
                                Go to Jobs
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedJobs;
