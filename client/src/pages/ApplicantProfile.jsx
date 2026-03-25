import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Mail, Phone, MapPin, User, GraduationCap, Briefcase, Calendar, Award } from "lucide-react";

const ApplicantProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [applicant, setApplicant] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchApplicant = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:5000/v1/api/users/applicants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setApplicant(res.data || null);
            } catch (e) {
                const msg = e?.response?.data?.message || "Failed to load applicant profile";
                setError(msg);
                setApplicant(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchApplicant();
    }, [id]);

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading applicant profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h3 className="mb-0 fw-bold">Applicant Profile</h3>
                    <div />
                </div>

                {error ? (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                ) : null}

                {applicant ? (
                    <div className="row g-4">
                        {/* Header Card */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4">
                                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center">
                                                <User size={32} className="text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="fw-bold mb-1">{applicant?.name || "N/A"}</h4>
                                                <div className="text-muted small d-flex flex-wrap gap-3">
                                                    <span className="d-flex align-items-center gap-1">
                                                        <Mail size={14} /> {applicant?.email || "N/A"}
                                                    </span>
                                                    <span className="d-flex align-items-center gap-1">
                                                        <Phone size={14} /> {applicant?.phone || "N/A"}
                                                    </span>
                                                    <span className="d-flex align-items-center gap-1">
                                                        <MapPin size={14} /> {applicant?.location || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {applicant?.bio ? (
                                        <div className="mt-4 pt-4 border-top">
                                            <h5 className="fw-bold mb-2">About</h5>
                                            <p className="text-muted mb-0">{applicant.bio}</p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Skills Card */}
                        {Array.isArray(applicant?.skills) && applicant.skills.length > 0 && (
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                            <Award size={20} className="text-primary" /> Skills
                                        </h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {applicant.skills.map((s) => (
                                                <span key={s} className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Education Card */}
                        {Array.isArray(applicant?.education) && applicant.education.length > 0 && (
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                            <GraduationCap size={20} className="text-primary" /> Education
                                        </h5>
                                        <div className="d-flex flex-column gap-3">
                                            {applicant.education.map((e) => (
                                                <div key={e?._id || `${e?.institution}-${e?.degree}`} className="border-start border-3 border-primary ps-3">
                                                    <div className="fw-bold">{e?.institution || "N/A"}</div>
                                                    <div className="text-muted small">
                                                        {e?.degree || ""}{e?.year ? ` • ${e.year}` : ""}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Experience Card */}
                        {Array.isArray(applicant?.experience) && applicant.experience.length > 0 && (
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                            <Briefcase size={20} className="text-primary" /> Experience
                                        </h5>
                                        <div className="row g-3">
                                            {applicant.experience.map((ex) => (
                                                <div key={ex?._id || `${ex?.company}-${ex?.position}`} className="col-md-6">
                                                    <div className="border rounded-3 p-3 bg-white h-100">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="fw-bold">{ex?.position || "N/A"}</div>
                                                            {ex?.duration ? (
                                                                <span className="badge bg-light text-dark small d-flex align-items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {ex.duration}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-muted small mb-2">
                                                            {ex?.company || "N/A"}
                                                        </div>
                                                        {ex?.description ? (
                                                            <div className="text-muted small">{ex.description}</div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resume Card */}
                        {applicant?.resume ? (
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3">Resume</h5>
                                        <a
                                            href={`http://localhost:5000${applicant.resume}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                                        >
                                            <Award size={16} /> View Resume
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="alert alert-warning" role="alert">
                        Applicant not found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicantProfile;
