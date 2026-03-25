import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Briefcase, MapPin, AlignLeft, DollarSign, FileText, Users, Clock } from "lucide-react";
import axios from "axios";

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [customCategoryName, setCustomCategoryName] = useState("");
    const [formData, setFormData] = useState({

        title: "",
        location: "",
        salary: "",
        jobType: "Full-time",
        description: "",
        requirements: [],
        categoryId: "",
    });

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
                setCompanyProfile(null);
            }
        };

        fetchCategories();
        fetchCompanyProfile();
    }, []);

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'title':
                if (!value.trim()) error = 'Job title is required';
                else if (value.trim().length < 3) error = 'Job title must be at least 3 characters';
                else if (value.trim().length > 100) error = 'Job title must be less than 100 characters';
                break;
            case 'location':
                if (!value.trim()) error = 'Location is required';
                else if (value.trim().length < 3) error = 'Location must be at least 3 characters';
                break;
            case 'description':
                if (!value.trim()) error = 'Job description is required';
                else if (value.trim().length < 20) error = 'Job description must be at least 20 characters';
                else if (value.trim().length > 2000) error = 'Job description must be less than 2000 characters';
                break;
            case 'requirements':
                if (Array.isArray(value) && value.length === 0) error = 'At least one requirement is needed';
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'requirements') {
            const requirementsArray = value.split(',').map(req => req.trim()).filter(req => req !== '');
            setFormData(prev => ({ ...prev, requirements: requirementsArray }));
        } else if (name === 'categoryId') {
            setFormData(prev => ({ ...prev, categoryId: value }));
            if (String(value) !== 'other') {
                setCustomCategoryName("");
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate all fields
        newErrors.title = validateField('title', formData.title);
        newErrors.location = validateField('location', formData.location);
        newErrors.description = validateField('description', formData.description);
        newErrors.requirements = validateField('requirements', formData.requirements);

        setErrors(newErrors);

        // Check if there are any errors
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            alert("Please fix the highlighted errors before submitting.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const companyName = companyProfile?.companyName || companyProfile?.companyProfile?.companyName;
            if (!companyName) {
                alert("Company name is missing. Please update your Company Profile before posting a job.");
                setLoading(false);
                return;
            }

            const isOtherCategory = String(formData.categoryId) === 'other';
            if (isOtherCategory && !customCategoryName.trim()) {
                alert("Please enter a category name");
                setLoading(false);
                return;
            }

            const jobData = {
                ...formData,
                categoryId: isOtherCategory ? "" : formData.categoryId,
                categoryName: isOtherCategory ? customCategoryName.trim() : undefined,
                company: companyName
            };

            await axios.post("http://localhost:5000/v1/api/jobs/create", jobData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Job posted successfully!");
            navigate("/dashboard/recruiter");

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to post job");
        } finally {
            setLoading(false);
        }
    };

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
                            <h2 className="fw-bold mb-4">Post a New Job</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Job Title */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Job Title *</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white"><Briefcase size={18} /></span>
                                            <input
                                                type="text" name="title" className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                placeholder="e.g. Senior Frontend Developer" required value={formData.title} onChange={handleChange} onBlur={handleBlur}
                                            />
                                            {errors.title && (
                                                <div className="invalid-feedback">
                                                    {errors.title}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Location</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white"><MapPin size={18} /></span>
                                            <input
                                                type="text" name="location" className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                                placeholder="e.g. Surat, Remote" required value={formData.location} onChange={handleChange} onBlur={handleBlur}
                                            />
                                            {errors.location && (
                                                <div className="invalid-feedback">
                                                    {errors.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Salary (Optional)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">₹</span>
                                            <input
                                                type="text" name="salary" className="form-control"
                                                placeholder="e.g. 5 LPA - 8 LPA" value={formData.salary} onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Category</label>
                                        <select
                                            name="categoryId"
                                            className="form-select"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <option value="">Select category (optional)</option>
                                            {categories.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    {String(formData.categoryId) === 'other' && (
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-semibold">Enter Category Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={customCategoryName}
                                                onChange={(e) => setCustomCategoryName(e.target.value)}
                                                placeholder="e.g. Data Science"
                                            />
                                        </div>
                                    )}
                                    {/* Job Type */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Job Type</label>
                                        <select name="jobType" className="form-select" value={formData.jobType} onChange={handleChange}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>

                                    {/* Requirements */}
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Requirements (Comma Separated)</label>
                                        <textarea
                                            name="requirements" className="form-control" rows="5"
                                            placeholder="React, Node.js, MongoDB, JavaScript" required value={Array.isArray(formData.requirements) ? formData.requirements.join(', ') : ''} onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    {/* Description */}
                                    <div className="col-md-12 mb-4">
                                        <label className="form-label fw-semibold">Job Description</label>
                                        <textarea
                                            name="description" className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows="5"
                                            placeholder="Describe the role and responsibilities..." required value={formData.description} onChange={handleChange} onBlur={handleBlur}
                                        ></textarea>
                                        {errors.description && (
                                            <div className="invalid-feedback d-block">
                                                {errors.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-12">
                                        <button
                                            type="submit" disabled={loading}
                                            className="btn bg-primary text-white w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (

                                                <>Post Job <Send size={18} /></>
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
export default PostJob;