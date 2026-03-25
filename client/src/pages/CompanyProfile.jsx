import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Users, Calendar, Globe, Linkedin, Twitter, Facebook, Mail, Phone, ExternalLink, Briefcase, Edit } from "lucide-react";
import axios from "axios";
import ReviewsList from "../components/ReviewsList";

const CompanyProfile = () => {
    const { recruiterId } = useParams();
    const navigate = useNavigate();
    const [companyProfile, setCompanyProfile] = useState(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchCompanyProfile();
        fetchCompanyJobs();
        setCurrentUser(JSON.parse(localStorage.getItem("user")));
    }, [recruiterId]);

    const fetchCompanyProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/v1/api/recruiters/company-profile/${recruiterId}`);
            setCompanyProfile(response.data);
        } catch (error) {
            console.error("Error fetching company profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyJobs = async () => {
        try {
            const response = await axios.get("http://localhost:5000/v1/api/jobs/all");
            const companyJobs = response.data.filter(job => job.createdBy === recruiterId);
            setCompanyJobs(companyJobs);
        } catch (error) {
            console.error("Error fetching company jobs:", error);
        } finally {
            setJobsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleEditProfile = () => {
        // Navigate to company onboarding page with edit mode
        navigate("/company-onboarding", { state: { editMode: true, companyData: companyProfile } });
    };

    const isProfileOwner = () => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        return currentUser && currentUser._id === recruiterId;
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading company profile...</p>
                </div>
            </div>
        );
    }

    if (!companyProfile) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <Building2 size={64} className="text-muted mb-3" />
                    <h3 className="text-muted">Company Profile Not Found</h3>
                    <p className="text-muted mb-4">This company hasn't set up their profile yet.</p>
                    <button className="btn btn-primary" onClick={handleBack}>
                        <ArrowLeft size={18} className="me-2" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="row">
                <div className="col-12">
                    {/* --- HEADER --- */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                            <button
                                className="btn btn-outline-secondary me-3"
                                onClick={handleBack}
                            >
                                <ArrowLeft size={20} /> Back
                            </button>
                            <h4 className="mb-0 fw-bold">Company Profile</h4>
                        </div>
                        {isProfileOwner() && (
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={handleEditProfile}
                            >
                                <Edit size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* --- COMPANY HEADER CARD --- */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-md-3 text-center">
                                    {companyProfile.logo ? (
                                        <img
                                            src={companyProfile.logo}
                                            alt={`${companyProfile.companyName} logo`}
                                            className="img-fluid rounded-3 mb-3"
                                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                                        />
                                    ) : (
                                        <div className="bg-light rounded-3 d-flex align-items-center justify-content-center mb-3" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                                            <Building2 size={64} className="text-muted" />
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-9">
                                    <h2 className="fw-bold text-primary mb-3">{companyProfile.companyName}</h2>
                                    <div className="d-flex flex-wrap gap-3 mb-3">
                                        <span className="badge bg-primary fs-6 px-3 py-2">
                                            {companyProfile.industry}
                                        </span>
                                        <span className="badge bg-secondary fs-6 px-3 py-2">
                                            {companyProfile.companySize}
                                        </span>
                                        <span className="text-muted d-flex align-items-center">
                                            <MapPin size={16} className="me-1" />
                                            {companyProfile.headquarters}
                                        </span>
                                        <span className="text-muted d-flex align-items-center">
                                            <Calendar size={16} className="me-1" />
                                            Founded {companyProfile.foundedYear}
                                        </span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {companyProfile.website && (
                                            <a href={companyProfile.website} target="_blank" className="btn btn-sm btn-outline-primary">
                                                <Globe size={14} className="me-1" />
                                                Website
                                            </a>
                                        )}
                                        {companyProfile.linkedin && (
                                            <a href={companyProfile.linkedin} target="_blank" className="btn btn-sm btn-outline-info">
                                                <Linkedin size={14} className="me-1" />
                                                LinkedIn
                                            </a>
                                        )}
                                        {companyProfile.twitter && (
                                            <a href={companyProfile.twitter} target="_blank" className="btn btn-sm btn-outline-info">
                                                <Twitter size={14} className="me-1" />
                                                Twitter
                                            </a>
                                        )}
                                        {companyProfile.facebook && (
                                            <a href={companyProfile.facebook} target="_blank" className="btn btn-sm btn-outline-primary">
                                                <Facebook size={14} className="me-1" />
                                                Facebook
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- COMPANY DETAILS --- */}
                    <div className="row">
                        <div className="col-md-8">
                            {/* --- ABOUT COMPANY --- */}
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="mb-0 fw-bold">About Company</h5>
                                </div>
                                <div className="card-body p-4">
                                    <p className="text-muted" style={{ lineHeight: '1.8' }}>
                                        {companyProfile.aboutUs}
                                    </p>
                                </div>
                            </div>

                            {/* --- COMPANY REVIEWS --- */}
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="mb-0 fw-bold">Reviews & Ratings</h5>
                                </div>
                                <div className="card-body p-4">
                                    <ReviewsList
                                        companyId={recruiterId}
                                        currentUser={currentUser}
                                        isCompanyOwner={isProfileOwner()}
                                    />
                                </div>
                            </div>

                            {/* --- COMPANY JOBS --- */}
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">Open Positions ({companyJobs.length})</h5>
                                </div>
                                <div className="card-body p-0">
                                    {jobsLoading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading jobs...</span>
                                            </div>
                                        </div>
                                    ) : companyJobs.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="ps-4">Job Title</th>
                                                        <th>Location</th>
                                                        <th>Type</th>
                                                        <th>Posted Date</th>
                                                        <th className="text-center pe-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {companyJobs.map((job) => (
                                                        <tr key={job._id}>
                                                            <td className="ps-4">
                                                                <div className="fw-bold text-dark">{job.title}</div>
                                                                <small className="text-muted">{job.description?.substring(0, 50)}...</small>
                                                            </td>
                                                            <td>{job.location}</td>
                                                            <td>
                                                                <span className={`badge rounded-pill ${job.jobType === 'Full-time' ? 'bg-primary' : 'bg-info'} px-3`}>
                                                                    {job.jobType}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                                            <td className="text-center pe-4">
                                                                <button
                                                                    className="btn btn-sm btn-primary rounded-pill px-3"
                                                                    onClick={() => navigate(`/job/${job._id}`)}
                                                                >
                                                                    View Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Briefcase size={48} className="text-muted mb-3" />
                                            <p className="text-muted">No open positions at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            {/* --- CONTACT INFORMATION --- */}
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="mb-0 fw-bold">Contact Information</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="mb-3">
                                        <h6 className="text-muted mb-2">Address</h6>
                                        <p className="mb-2">{companyProfile.address}</p>
                                        <p className="mb-2">{companyProfile.city}, {companyProfile.country}</p>
                                        <p className="mb-0">{companyProfile.postalCode}</p>
                                    </div>
                                    {companyProfile.email && (
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Email</h6>
                                            <a href={`mailto:${companyProfile.email}`} className="text-primary text-decoration-none">
                                                <Mail size={16} className="me-2" />
                                                {companyProfile.email}
                                            </a>
                                        </div>
                                    )}
                                    {companyProfile.phone && (
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-2">Phone</h6>
                                            <a href={`tel:${companyProfile.phone}`} className="text-primary text-decoration-none">
                                                <Phone size={16} className="me-2" />
                                                {companyProfile.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- COMPANY STATS --- */}
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="mb-0 fw-bold">Company Stats</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Industry</span>
                                        <span className="fw-bold">{companyProfile.industry}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Company Size</span>
                                        <span className="fw-bold">{companyProfile.companySize}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Founded</span>
                                        <span className="fw-bold">{companyProfile.foundedYear}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">Headquarters</span>
                                        <span className="fw-bold">{companyProfile.headquarters}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
