import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Save, Edit2, Plus, X, Upload, FileText } from "lucide-react";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        skills: [],
        experience: [],
        education: [],
        resume: ""
    });

    const [newSkill, setNewSkill] = useState("");
    const [newExperience, setNewExperience] = useState({
        company: "",
        position: "",
        duration: "",
        description: ""
    });
    const [newEducation, setNewEducation] = useState({
        institution: "",
        degree: "",
        year: ""
    });

    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/v1/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                // Ensure all fields are properly initialized
                setProfile({
                    name: response.data.name || user?.name || "",
                    email: response.data.email || user?.email || "",
                    phone: response.data.phone || "",
                    location: response.data.location || "",
                    bio: response.data.bio || "",
                    skills: response.data.skills || [],
                    experience: response.data.experience || [],
                    education: response.data.education || [],
                    resume: response.data.resume || ""
                });
            } else {
                // If no profile exists, use user data from localStorage
                setProfile({
                    name: user?.name || "",
                    email: user?.email || "",
                    phone: "",
                    location: "",
                    bio: "",
                    skills: [],
                    experience: [],
                    education: [],
                    resume: ""
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Use localStorage data as fallback
            setProfile({
                name: user?.name || "",
                email: user?.email || "",
                phone: "",
                location: "",
                bio: "",
                skills: [],
                experience: [],
                education: [],
                resume: ""
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            console.log("Sending profile data:", JSON.stringify(profile, null, 2));

            const response = await axios.put("http://localhost:5000/v1/api/users/profile", profile, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Server response:", response.data);

            // Update localStorage user data
            const updatedUser = { ...user, name: profile.name };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("Profile updated successfully!");
            setEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error.response?.data || error.message);
            alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile({
                ...profile,
                skills: [...profile.skills, newSkill.trim()]
            });
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile({
            ...profile,
            skills: profile.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const addExperience = () => {
        if (newExperience.company && newExperience.position) {
            setProfile({
                ...profile,
                experience: [...profile.experience, { ...newExperience, id: Date.now() }]
            });
            setNewExperience({ company: "", position: "", duration: "", description: "" });
        }
    };

    const removeExperience = (id) => {
        setProfile({
            ...profile,
            experience: profile.experience.filter(exp => exp.id !== id)
        });
    };

    const addEducation = () => {
        if (newEducation.institution && newEducation.degree) {
            setProfile({
                ...profile,
                education: [...profile.education, { ...newEducation, id: Date.now() }]
            });
            setNewEducation({ institution: "", degree: "", year: "" });
        }
    };

    const removeEducation = (id) => {
        setProfile({
            ...profile,
            education: profile.education.filter(edu => edu.id !== id)
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
            return;
        }

        if (file.size > maxSize) {
            alert('File size exceeds 5MB limit.');
            return;
        }

        await uploadResume(file);
    };

    const uploadResume = async (file) => {
        const formData = new FormData();
        formData.append('resume', file);

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/v1/api/users/upload-resume", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile({
                ...profile,
                resume: response.data.resumeUrl
            });

            alert('Resume uploaded successfully!');
        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const deleteResume = async () => {
        if (!profile.resume) {
            alert('No resume to delete');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete your resume? This action cannot be undone.');
        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete('http://localhost:5000/v1/api/resumes/resume', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update profile state
            setProfile({
                ...profile,
                resume: ""
            });

            // Update localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            user.resume = "";
            localStorage.setItem("user", JSON.stringify(user));

            alert('Resume deleted successfully!');
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Failed to delete resume');
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading profile...</p>
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
                    <h3 className="mb-0 fw-bold">My Profile</h3>
                    <div className="d-flex gap-2">
                        {editing ? (
                            <>
                                <button
                                    className="btn btn-success d-flex align-items-center gap-2"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    <Save size={18} /> {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                    onClick={() => setEditing(false)}
                                >
                                    <X size={18} /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={() => setEditing(true)}
                            >
                                <Edit2 size={18} /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="row">
                    {/* Basic Info */}
                    <div className="col-md-4 mb-4">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                                        <User size={40} />
                                    </div>
                                    <h5 className="mt-3 mb-1 fw-bold">{profile.name}</h5>
                                    <p className="text-muted">{profile.email}</p>
                                </div>

                                {editing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="form-label fw-semibold">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                disabled
                                            />
                                            <small className="text-muted">Email cannot be changed</small>
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold">Location</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profile.location}
                                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {profile.phone && (
                                            <div className="d-flex align-items-center gap-2">
                                                <Phone size={16} className="text-muted" />
                                                <span>{profile.phone}</span>
                                            </div>
                                        )}
                                        {profile.location && (
                                            <div className="d-flex align-items-center gap-2">
                                                <MapPin size={16} className="text-muted" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="col-md-8">
                        {/* Bio */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Professional Summary</h6>
                                {editing ? (
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        placeholder="Tell us about yourself, your experience, and career goals..."
                                    />
                                ) : (
                                    <p className="text-muted">
                                        {profile.bio || "No professional summary added yet."}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Skills</h6>
                                {editing ? (
                                    <div>
                                        <div className="d-flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                placeholder="Add a skill"
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            />
                                            <button className="btn btn-primary" onClick={addSkill}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {profile.skills.map((skill, index) => (
                                                <span key={index} className="badge bg-primary d-flex align-items-center gap-1">
                                                    {skill}
                                                    <button
                                                        className="btn btn-sm btn-link text-white p-0"
                                                        onClick={() => removeSkill(skill)}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {profile.skills.length > 0 ? (
                                            profile.skills.map((skill, index) => (
                                                <span key={index} className="badge bg-primary">{skill}</span>
                                            ))
                                        ) : (
                                            <p className="text-muted">No skills added yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resume */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Resume</h6>
                                {editing ? (
                                    <div>
                                        <div className="border rounded p-3 mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <input
                                                    type="file"
                                                    id="resume-upload"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileUpload}
                                                    style={{ display: 'none' }}
                                                />
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="btn btn-outline-primary d-flex align-items-center gap-2 cursor-pointer"
                                                >
                                                    <Upload size={18} />
                                                    {uploading ? 'Uploading...' : 'Upload Resume'}
                                                </label>
                                                <small className="text-muted">PDF, DOC, DOCX (Max 5MB)</small>
                                            </div>
                                        </div>
                                        {profile.resume && (
                                            <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                                                <FileText size={18} className="text-primary" />
                                                <span className="text-muted">Current resume uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {profile.resume ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <FileText size={18} className="text-primary" />
                                                <span className="text-muted">Resume uploaded</span>
                                                <button
                                                    className="btn btn-sm btn-outline-primary ms-2"
                                                    onClick={() => {
                                                        if (profile.resume) {
                                                            const resumeUrl = profile.resume.startsWith('/uploads/')
                                                                ? `http://localhost:5000${profile.resume}`
                                                                : profile.resume;
                                                            window.open(resumeUrl, '_blank');
                                                        } else {
                                                            alert('No resume available');
                                                        }
                                                    }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger ms-2"
                                                    onClick={deleteResume}
                                                    disabled={uploading}
                                                >
                                                    <X size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-muted">No resume uploaded yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Experience</h6>
                                {editing ? (
                                    <div>
                                        <div className="border rounded p-3 mb-3">
                                            <div className="row g-2">
                                                <div className="col-md-4">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Company"
                                                        value={newExperience.company}
                                                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Position"
                                                        value={newExperience.position}
                                                        onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Duration"
                                                        value={newExperience.duration}
                                                        onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <button className="btn btn-primary w-100" onClick={addExperience}>
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Job Description (optional)"
                                                    value={newExperience.description}
                                                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {profile.experience.map((exp) => (
                                            <div key={exp.id} className="border rounded p-3 mb-2 d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold">{exp.position}</h6>
                                                    <p className="text-muted mb-1">{exp.company}</p>
                                                    <small className="text-muted">{exp.duration}</small>
                                                    {exp.description && <p className="mt-2 small">{exp.description}</p>}
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeExperience(exp.id)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        {profile.experience.length > 0 ? (
                                            profile.experience.map((exp, index) => (
                                                <div key={exp.id || index} className="border-bottom pb-3 mb-3">
                                                    <h6 className="fw-bold">{exp.position}</h6>
                                                    <p className="text-muted mb-1">{exp.company}</p>
                                                    <small className="text-muted">{exp.duration}</small>
                                                    {exp.description && <p className="mt-2">{exp.description}</p>}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">No experience added yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Education</h6>
                                {editing ? (
                                    <div>
                                        <div className="border rounded p-3 mb-3">
                                            <div className="row g-2">
                                                <div className="col-md-4">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Institution"
                                                        value={newEducation.institution}
                                                        onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Degree"
                                                        value={newEducation.degree}
                                                        onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Year"
                                                        value={newEducation.year}
                                                        onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-1">
                                                    <button className="btn btn-primary w-100" onClick={addEducation}>
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {profile.education.map((edu) => (
                                            <div key={edu.id} className="border rounded p-3 mb-2 d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold">{edu.degree}</h6>
                                                    <p className="text-muted mb-1">{edu.institution}</p>
                                                    <small className="text-muted">{edu.year}</small>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeEducation(edu.id)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        {profile.education.length > 0 ? (
                                            profile.education.map((edu, index) => (
                                                <div key={edu.id || index} className="border-bottom pb-3 mb-3">
                                                    <h6 className="fw-bold">{edu.degree}</h6>
                                                    <p className="text-muted mb-1">{edu.institution}</p>
                                                    <small className="text-muted">{edu.year}</small>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">No education added yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
