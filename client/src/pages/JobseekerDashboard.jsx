import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { Search, MapPin, Briefcase, Send, LogOut, Filter, FileText, User, Bookmark, MoreVertical, Bell } from "lucide-react";

import axios from "axios";

import toast from 'react-hot-toast';

import JobFilters from "../components/JobFilters";

import DarkModeToggle from "../components/DarkModeToggle";



const SeekerDashboard = () => {

    const user = JSON.parse(localStorage.getItem("user"));

    const navigate = useNavigate();



    // States

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [applicationsCount, setApplicationsCount] = useState(0);

    const [pendingCount, setPendingCount] = useState(0);

    const [interviewScheduledCount, setInterviewScheduledCount] = useState(0);

    const [savedJobIds, setSavedJobIds] = useState(new Set());

    const [savingJobId, setSavingJobId] = useState(null);

    const [searchQuery, setSearchQuery] = useState(""); // For Search Logic

    const [filters, setFilters] = useState({

        jobType: '',

        company: '',

        postedWithin: ''

    });



    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

    };



    useEffect(() => {

        const fetchAllJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const res = await axios.get("http://localhost:5000/v1/api/jobs/all", {

                    headers: { Authorization: `Bearer ${token}` }

                });

                setJobs(res.data);

            } catch (err) {

                console.error("Error fetching jobs:", err);

            } finally {

                setLoading(false);

            }

        };



        const fetchSavedJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const res = await axios.get("http://localhost:5000/v1/api/users/saved-jobs", {

                    headers: { Authorization: `Bearer ${token}` }

                });

                const savedJobs = res.data?.savedJobs || [];

                setSavedJobIds(new Set(savedJobs.map((j) => j._id)));

            } catch (err) {

                console.error("Error fetching saved jobs:", err);

            }

        };



        const fetchMyApplicationsCount = async () => {

            try {

                const token = localStorage.getItem("token");

                const res = await axios.get("http://localhost:5000/v1/api/applications/my-applications", {

                    headers: { Authorization: `Bearer ${token}` }

                });

                const applications = res.data.applications || [];

                setApplicationsCount(applications.length);

                const pending = applications.filter(app => app.status === 'pending').length;

                const interviewScheduled = applications.filter(app => app.status === 'interview_scheduled').length;

                setPendingCount(pending);

                setInterviewScheduledCount(interviewScheduled);

            } catch (err) {

                console.error("Error fetching applications count:", err);

            }

        };

        fetchAllJobs();

        fetchSavedJobs();

        fetchMyApplicationsCount();

    }, []);



    const handleToggleSave = async (jobId) => {

        if (!jobId) return;

        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/login");

            return;

        }



        setSavingJobId(jobId);

        try {

            const res = await axios.post(`http://localhost:5000/v1/api/users/saved-jobs/${jobId}/toggle`, {}, {

                headers: { Authorization: `Bearer ${token}` }

            });



            const saved = !!res.data?.saved;

            setSavedJobIds((prev) => {

                const next = new Set(prev);

                if (saved) next.add(jobId);

                else next.delete(jobId);

                return next;

            });

        } catch (error) {

            console.error("Error toggling saved job:", error);

            toast.error(error?.response?.data?.message || "Failed to save job");

        } finally {

            setSavingJobId(null);

        }

    };



    // --- ENHANCED FILTERING LOGIC ---

    const filteredJobs = jobs.filter((job) => {

        // Text search

        const matchesSearch = !searchQuery ||

            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||

            job.company.toLowerCase().includes(searchQuery.toLowerCase());



        // Job type filter

        const matchesJobType = !filters.jobType ||

            job.jobType === filters.jobType;



        // Company filter

        const matchesCompany = !filters.company ||

            job.company.toLowerCase().includes(filters.company.toLowerCase());



        // Posted date filter

        const matchesPostedDate = !filters.postedWithin ||

            (() => {

                const jobDate = new Date(job.createdAt);

                const now = new Date();

                const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24);

                return daysDiff <= parseInt(filters.postedWithin);

            })();



        return matchesSearch && matchesJobType && matchesCompany && matchesPostedDate;

    });



    const handleFiltersChange = (newFilters) => {

        setFilters(newFilters);

    };



    const handleClearFilters = () => {

        setFilters({

            jobType: '',

            company: '',

            postedWithin: ''

        });

    };



    return (

        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">

                {/* --- TOP HEADER --- */}

                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 overflow-visible position-relative" style={{ zIndex: 2000 }}>

                    <div className="card-body p-4">

                        <div className="row align-items-center">

                            <div className="col-md-6">

                                <div className="d-flex align-items-center gap-3">

                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>

                                        <User size={28} />

                                    </div>

                                    <div>

                                        <h1 className="fw-bold mb-1 fs-2">Welcome back, {user?.name}! 👋</h1>

                                        <p className="text-muted mb-0">Explore exciting career opportunities tailored just for you</p>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6">



                                <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">

                                    <DarkModeToggle />

                                    <div className="dropdown position-relative" style={{ zIndex: 999 }}>

                                        <button

                                            className="btn btn-outline-primary d-flex align-items-center justify-content-center"

                                            type="button"

                                            data-bs-toggle="dropdown"

                                            aria-expanded="false"

                                            title="Menu"

                                        >

                                            <MoreVertical size={18} />

                                        </button>

                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm position-absolute" style={{ zIndex: 9999 }}>

                                            <li>

                                                <button className="dropdown-item d-flex align-items-center gap-2" type="button" onClick={() => navigate("/profile")}>

                                                    <User size={16} /> Profile

                                                </button>

                                            </li>

                                            <li>

                                                <button className="dropdown-item d-flex align-items-center gap-2" type="button" onClick={() => navigate("/my-applications")}>

                                                    <FileText size={16} /> My Applications

                                                </button>

                                            </li>

                                            <li>

                                                <button className="dropdown-item d-flex align-items-center gap-2" type="button" onClick={() => navigate("/saved-jobs")}>

                                                    <Bookmark size={16} /> Saved Jobs

                                                </button>

                                            </li>

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

                        </div>

                    </div>

                </div>



                {/* --- SEARCH & FILTERS SECTION --- */}

                <div className="row g-4 mb-4 position-relative" style={{ zIndex: 1 }}>

                    <div className="col-12">

                        <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">

                            <div className="card-body p-4">

                                <div className="d-flex align-items-center gap-3 mb-3">

                                    <Search size={24} className="text-primary" />

                                    <h5 className="fw-bold mb-0">Search Jobs</h5>

                                </div>

                                <div className="input-group input-group-lg">

                                    <span className="input-group-text bg-light border-0 px-4">

                                        <Search size={22} className="text-muted" />

                                    </span>

                                    <input

                                        type="text"

                                        className="form-control bg-light border-0 ps-0 fs-5"

                                        placeholder="Search by Job Title, Company, or Location..."

                                        value={searchQuery}

                                        onChange={(e) => setSearchQuery(e.target.value)}

                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-12">

                        <JobFilters

                            filters={filters}

                            onFiltersChange={handleFiltersChange}

                            onClearFilters={handleClearFilters}

                        />

                    </div>

                </div>



                {/* --- RESULTS HEADER --- */}

                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">

                    <div className="card-body p-3">

                        <div className="row align-items-center">

                            <div className="col-md-6">

                                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">

                                    <Briefcase size={20} className="text-primary" />

                                    Job Opportunities

                                </h4>

                            </div>

                            <div className="col-md-6">

                                <div className="d-flex justify-content-end align-items-center gap-3">

                                    {filteredJobs.length !== jobs.length && (

                                        <button

                                            className="btn btn-sm btn-outline-secondary"

                                            onClick={() => {

                                                setSearchQuery("");

                                                handleClearFilters();

                                            }}

                                        >

                                            Clear Search

                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>



                {/* --- JOB LISTINGS GRID --- */}

                <div className="card border-0 shadow-sm rounded-4 bg-white">

                    <div className="card-body p-4">

                        {loading ? (

                            <div className="text-center py-5">

                                <div className="spinner-border text-primary" role="status"></div>

                                <p className="mt-2 text-muted">Fetching latest jobs...</p>

                            </div>

                        ) : filteredJobs.length > 0 ? (

                            <div className="row g-4">

                                {filteredJobs.map((job) => (

                                    <div className="col-md-6 col-lg-4" key={job._id}>

                                        <div className="card h-100 border-0 shadow-sm rounded-4 p-3 hover-lift transition-all">

                                            <div className="card-body d-flex flex-column">

                                                <div className="d-flex justify-content-between align-items-start mb-3">

                                                    <div className="bg-primary text-white p-2 rounded-3">

                                                        <Briefcase size={22} />

                                                    </div>

                                                    <span className="badge bg-info-subtle text-info border border-info-subtle px-2">

                                                        {job.jobType}

                                                    </span>

                                                </div>



                                                <h5 className="card-title fw-bold mb-1">{job.title}</h5>

                                                <p className="text-muted mb-3">{job.company}</p>



                                                <div className="mt-auto">

                                                    <div className="d-flex align-items-center text-muted small mb-4">

                                                        <MapPin size={16} className="me-2 text-primary" /> {job.location}

                                                    </div>



                                                    <div className="d-flex gap-2">

                                                        <button

                                                            type="button"

                                                            onClick={() => handleToggleSave(job._id)}

                                                            disabled={savingJobId === job._id}

                                                            className={`btn flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold ${savedJobIds.has(job._id) ? 'btn-outline-primary' : 'btn-outline-primary'}`}

                                                        >

                                                            {savingJobId === job._id ? (

                                                                <span className="spinner-border spinner-border-sm"></span>

                                                            ) : (

                                                                <>

                                                                    <Bookmark size={16} /> {savedJobIds.has(job._id) ? 'Saved' : 'Save'}

                                                                </>

                                                            )}

                                                        </button>



                                                        <button

                                                            type="button"

                                                            onClick={() => navigate(`/job/${job._id}`)}

                                                            className="btn flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold text-white"

                                                            style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}

                                                        >

                                                            View Details <Send size={16} />

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        ) : (

                            /* --- EMPTY SEARCH STATE --- */

                            <div className="text-center py-5">

                                <div className="mb-3">

                                    <Search size={50} className="text-muted opacity-25" />

                                </div>

                                <h5 className="text-muted">No jobs match "{searchQuery}"</h5>

                                <p className="text-muted">Try adjusting your search terms or filters</p>

                                <button className="btn btn-link text-primary" onClick={() => setSearchQuery("")}>

                                    Clear all filters

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

};



export default SeekerDashboard;