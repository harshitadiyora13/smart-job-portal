import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Briefcase, MapPin } from "lucide-react";
import axios from "axios";
import toast from 'react-hot-toast';

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState({
        title: "",
        company: "",
        location: "",
        salary: "",
        jobType: "Full-time",
        description: "",
        requirements: [],
        categoryId: ""
    });
    const [companyProfile, setCompanyProfile] = useState(null);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchJob = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/v1/api/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || {};
            setJob({
                title: data.title || "",
                company: data.company || "",
                location: data.location || "",
                salary: data.salary || "",
                jobType: data.jobType || "Full-time",
                description: data.description || "",
                requirements: Array.isArray(data.requirements) ? data.requirements : [],
                categoryId: data.categoryId || data.category?._id || ""
            });
        } catch (error) {
            console.error("Error fetching job:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:5000/v1/api/jobs/categories");
                setCategories(res.data.categories || []);
            } catch (e) {
                setCategories([]);
            }
        };

        const fetchCompanyProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/v1/api/recruiters/company-profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompanyProfile(res.data);
            } catch (e) {
                console.error("Failed to fetch company profile:", e);
            }
        };

        fetchCategories();
        fetchCompanyProfile();
        fetchJob();
    }, [fetchJob]);

    useEffect(() => {
        const companyName = companyProfile?.companyName || companyProfile?.companyProfile?.companyName || "";
        if (!companyName) return;

        setJob((prev) => {
            if ((prev.company || "").trim()) return prev;
            return { ...prev, company: companyName };
        });
    }, [companyProfile]);

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "title":
                if (!value.trim()) error = "Job title is required";
                else if (value.trim().length < 3) error = "Job title must be at least 3 characters";
                else if (value.trim().length > 100) error = "Job title must be less than 100 characters";
                break;
            case "location":
                if (!value.trim()) error = "Location is required";
                else if (value.trim().length < 3) error = "Location must be at least 3 characters";
                break;
            case "description":
                if (!value.trim()) error = "Job description is required";
                else if (value.trim().length < 20) error = "Job description must be at least 20 characters";
                else if (value.trim().length > 2000) error = "Job description must be less than 2000 characters";
                break;
            case "requirements":
                if (Array.isArray(value) && value.length === 0) error = "At least one requirement is needed";
                break;
            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "requirements") {
            const requirementsArray = value.split(",").map((req) => req.trim()).filter((req) => req !== "");
            setJob({ ...job, requirements: requirementsArray });
        } else {
            setJob({ ...job, [name]: value });
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, name === "requirements" ? job.requirements : value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const newErrors = {};

        newErrors.title = validateField("title", job.title);
        newErrors.location = validateField("location", job.location);
        newErrors.description = validateField("description", job.description);
        newErrors.requirements = validateField("requirements", job.requirements);

        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e !== "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem("token");

            const companyName = (job.company || "").trim() || companyProfile?.companyProfile?.companyName || "";

            const jobData = {
                ...job,
                company: companyName
            };

            await axios.put(`http://localhost:5000/v1/api/jobs/update/${id}`, jobData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Job updated successfully!");
            navigate("/dashboard/recruiter");
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error(error?.response?.data?.message || "Failed to update job");
        } finally {
            setSaving(false);
        }
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

    return (
        <div className="container py-5">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="btn btn-link text-decoration-none text-muted p-0 mb-4 d-flex align-items-center gap-2"
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="fw-bold mb-4">Edit Job</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Job Title */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Job Title *</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white"><Briefcase size={18} /></span>
                                            <input
                                                type="text"
                                                name="title"
                                                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                                                placeholder="e.g. Senior Frontend Developer"
                                                required
                                                value={job.title}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Location</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white"><MapPin size={18} /></span>
                                            <input
                                                type="text"
                                                name="location"
                                                className={`form-control ${errors.location ? "is-invalid" : ""}`}
                                                placeholder="e.g. Surat, Remote"
                                                required
                                                value={job.location}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Salary (Optional)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">₹</span>
                                            <input
                                                type="text"
                                                name="salary"
                                                className="form-control"
                                                placeholder="e.g. 5 LPA - 8 LPA"
                                                value={job.salary}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Category</label>
                                        <select
                                            name="categoryId"
                                            className="form-select"
                                            value={job.categoryId}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select category (optional)</option>
                                            {categories.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Job Type */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Job Type</label>
                                        <select
                                            name="jobType"
                                            className="form-select"
                                            value={job.jobType}
                                            onChange={handleChange}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>

                                    {/* Requirements */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Requirements (Comma Separated)</label>
                                        <textarea
                                            name="requirements"
                                            className={`form-control ${errors.requirements ? "is-invalid" : ""}`}
                                            rows="5"
                                            placeholder="React, Node.js, MongoDB, JavaScript"
                                            required
                                            value={Array.isArray(job.requirements) ? job.requirements.join(", ") : ""}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        ></textarea>
                                        {errors.requirements && <div className="invalid-feedback">{errors.requirements}</div>}
                                    </div>

                                    {/* Description */}
                                    <div className="col-md-12 mb-4">
                                        <label className="form-label fw-semibold">Job Description</label>
                                        <textarea
                                            name="description"
                                            className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                            rows="5"
                                            placeholder="Describe the role and responsibilities..."
                                            required
                                            value={job.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        ></textarea>
                                        {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                                    </div>

                                    <div className="col-12">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn bg-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        >
                                            {saving ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <>Update Job <Send size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditJob;
