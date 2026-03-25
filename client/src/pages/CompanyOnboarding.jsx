import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Cloud, ArrowRight, ArrowLeft, Check, Bold, Italic, List, ListOrdered } from 'lucide-react';
import axios from 'axios';
import './CompanyOnboarding.css';

const CompanyOnboarding = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [aboutUsText, setAboutUsText] = useState('');
    const [editMode, setEditMode] = useState(false);
    const aboutUsRef = useRef(null);

    const [formData, setFormData] = useState({
        // Company Info
        companyName: '',
        aboutUs: '',
        logo: null,
        banner: null,

        // Founding Info
        foundedYear: '',
        companySize: '',
        industry: '',
        headquarters: '',

        // Social Media
        website: '',
        linkedin: '',
        twitter: '',
        facebook: '',

        // Contact
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        postalCode: ''
    });

    // Validation state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Check for edit mode and pre-fill form data
    useEffect(() => {
        if (location.state?.editMode && location.state?.companyData) {
            const companyData = location.state.companyData;
            setEditMode(true);

            // Pre-fill form with existing data
            setFormData({
                companyName: companyData.companyName || '',
                aboutUs: companyData.aboutUs || '',
                logo: companyData.logo || null,
                banner: companyData.banner || null,
                foundedYear: companyData.foundedYear || '',
                companySize: companyData.companySize || '',
                industry: companyData.industry || '',
                headquarters: companyData.headquarters || '',
                website: companyData.website || '',
                linkedin: companyData.linkedin || '',
                twitter: companyData.twitter || '',
                facebook: companyData.facebook || '',
                email: companyData.email || '',
                phone: companyData.phone || '',
                address: companyData.address || '',
                city: companyData.city || '',
                country: companyData.country || '',
                postalCode: companyData.postalCode || ''
            });

            // Set about us text for rich text editor
            if (companyData.aboutUs) {
                setAboutUsText(companyData.aboutUs);
            }
        }
    }, [location.state]);

    // Set rich text editor content when aboutUs changes
    useEffect(() => {
        if (aboutUsRef.current && formData.aboutUs) {
            aboutUsRef.current.innerHTML = formData.aboutUs;
        }
    }, [formData.aboutUs]);

    // Validation functions
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'companyName':
                if (!value.trim()) {
                    error = 'Company name is required';
                } else if (value.trim().length < 2) {
                    error = 'Company name must be at least 2 characters';
                } else if (value.trim().length > 100) {
                    error = 'Company name must be less than 100 characters';
                }
                break;

            case 'aboutUs':
                if (!value.trim()) {
                    error = 'About us is required';
                } else if (value.trim().length < 10) {
                    error = 'About us must be at least 10 characters';
                } else if (value.trim().length > 2000) {
                    error = 'About us must be less than 2000 characters';
                }
                break;

            case 'industry':
                if (!value) {
                    error = 'Industry is required';
                }
                break;

            case 'companySize':
                if (!value) {
                    error = 'Company size is required';
                }
                break;

            case 'foundedYear':
                if (value) {
                    const year = parseInt(value);
                    const currentYear = new Date().getFullYear();
                    if (isNaN(year) || year < 1900 || year > currentYear) {
                        error = `Please enter a valid year between 1900 and ${currentYear}`;
                    }
                }
                break;

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;

            case 'phone':
                if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;

            case 'website':
            case 'linkedin':
            case 'twitter':
            case 'facebook':
                if (value && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
                    error = 'Please enter a valid URL';
                }
                break;

            case 'address':
                if (value && value.trim().length > 200) {
                    error = 'Address must be less than 200 characters';
                }
                break;

            default:
                break;
        }

        return error;
    };

    const validateStep = (step) => {
        const stepErrors = {};

        switch (step) {
            case 1:
                stepErrors.companyName = validateField('companyName', formData.companyName);
                stepErrors.aboutUs = validateField('aboutUs', formData.aboutUs);
                break;

            case 2:
                stepErrors.foundedYear = validateField('foundedYear', formData.foundedYear);
                stepErrors.companySize = validateField('companySize', formData.companySize);
                stepErrors.industry = validateField('industry', formData.industry);
                stepErrors.headquarters = validateField('headquarters', formData.headquarters);
                break;

            case 3:
                stepErrors.website = validateField('website', formData.website);
                stepErrors.linkedin = validateField('linkedin', formData.linkedin);
                stepErrors.twitter = validateField('twitter', formData.twitter);
                stepErrors.facebook = validateField('facebook', formData.facebook);
                break;

            case 4:
                stepErrors.email = validateField('email', formData.email);
                stepErrors.phone = validateField('phone', formData.phone);
                stepErrors.address = validateField('address', formData.address);
                stepErrors.city = validateField('city', formData.city);
                stepErrors.country = validateField('country', formData.country);
                stepErrors.postalCode = validateField('postalCode', formData.postalCode);
                break;

            default:
                break;
        }

        return stepErrors;
    };

    const validateForm = () => {
        const allErrors = {};

        // Validate all steps
        for (let step = 1; step <= 4; step++) {
            const stepErrors = validateStep(step);
            Object.assign(allErrors, stepErrors);
        }

        return allErrors;
    };

    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFieldBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Rich text editor functions
    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        aboutUsRef.current?.focus();
    };

    const handleAboutUsChange = () => {
        const content = aboutUsRef.current?.innerHTML || '';
        setAboutUsText(content);
        setFormData(prev => ({ ...prev, aboutUs: content }));

        // Clear error for aboutUs field if it exists
        if (errors.aboutUs) {
            setErrors(prev => ({ ...prev, aboutUs: '' }));
        }
    };

    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const steps = [
        { id: 1, name: 'Company Info', icon: '🏢' },
        { id: 2, name: 'Founding Info', icon: '📅' },
        { id: 3, name: 'Social Media', icon: '📱' },
        { id: 4, name: 'Contact', icon: '📧' }
    ];

    const handleFileUpload = async (file, type) => {
        if (!file) return;

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await axios.post('http://localhost:5000/v1/api/upload/company-image', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(prev => ({
                ...prev,
                [type]: response.data.url
            }));

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileUpload(file, type);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = async () => {
        // Validate current step
        const stepErrors = validateStep(currentStep);
        setErrors(prev => ({ ...prev, ...stepErrors }));

        // Check if there are any errors in the current step
        const hasErrors = Object.values(stepErrors).some(error => error !== '');

        if (hasErrors) {
            // Mark all fields in current step as touched
            const stepFields = [];
            switch (currentStep) {
                case 1:
                    stepFields.push('companyName', 'aboutUs');
                    break;
                case 2:
                    stepFields.push('foundedYear', 'companySize', 'industry', 'headquarters');
                    break;
                case 3:
                    stepFields.push('website', 'linkedin', 'twitter', 'facebook');
                    break;
                case 4:
                    stepFields.push('email', 'phone', 'address', 'city', 'country', 'postalCode');
                    break;
                default:
                    break;
            }

            const newTouched = {};
            stepFields.forEach(field => {
                newTouched[field] = true;
            });
            setTouched(prev => ({ ...prev, ...newTouched }));

            // Show error message
            alert('Please fix the errors before proceeding to the next step.');
            return;
        }

        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            await handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        // Validate entire form
        const allErrors = validateForm();
        setErrors(allErrors);

        // Check if there are any errors
        const hasErrors = Object.values(allErrors).some(error => error !== '');

        if (hasErrors) {
            // Mark all fields as touched
            const allFields = ['companyName', 'aboutUs', 'foundedYear', 'companySize', 'industry', 'headquarters', 'website', 'linkedin', 'twitter', 'facebook', 'email', 'phone', 'address', 'city', 'country', 'postalCode'];
            const newTouched = {};
            allFields.forEach(field => {
                newTouched[field] = true;
            });
            setTouched(prev => ({ ...prev, ...newTouched }));

            alert('Please fix all errors before submitting the form.');
            return;
        }

        try {
            const token = localStorage.getItem("token");
            let response;

            if (editMode) {
                // Update existing profile
                response = await axios.put('http://localhost:5000/v1/api/recruiters/company-profile', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Company profile updated successfully!');
            } else {
                // Create new profile
                response = await axios.post('http://localhost:5000/v1/api/recruiters/company-profile', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Company profile created successfully!');
            }

            // Clear form and redirect to dashboard
            setFormData({
                companyName: '',
                aboutUs: '',
                logo: null,
                banner: null,
                foundedYear: '',
                companySize: '',
                industry: '',
                headquarters: '',
                website: '',
                linkedin: '',
                twitter: '',
                facebook: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
                postalCode: ''
            });

            // Redirect to recruiter dashboard
            window.location.href = '/dashboard/recruiter';
        } catch (error) {
            console.error('Submit error:', error);
            alert(`Failed to ${editMode ? 'update' : 'save'} company profile`);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="step-content">
                        <h4 className="step-title">Company Information</h4>

                        {/* Upload Section */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Upload Logo</label>
                                <div
                                    className="upload-area"
                                    onDrop={(e) => handleDrop(e, 'logo')}
                                    onDragOver={handleDragOver}
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                                        style={{ display: 'none' }}
                                    />
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo" className="uploaded-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Cloud size={48} className="text-muted mb-2" />
                                            <p className="mb-1">Drop logo here or click to upload</p>
                                            <small className="text-muted">A photo larger than 400 pixels works best. Max photo size 5 MB.</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Banner Image</label>
                                <div
                                    className="upload-area"
                                    onDrop={(e) => handleDrop(e, 'banner')}
                                    onDragOver={handleDragOver}
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    <input
                                        ref={bannerInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e.target.files[0], 'banner')}
                                        style={{ display: 'none' }}
                                    />
                                    {formData.banner ? (
                                        <img src={formData.banner} alt="Banner" className="uploaded-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Cloud size={48} className="text-muted mb-2" />
                                            <p className="mb-1">Drop banner here or click to upload</p>
                                            <small className="text-muted">A photo larger than 400 pixels works best. Max photo size 5 MB.</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Company Name */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Company Name *</label>
                            <input
                                type="text"
                                className={`form-control ${touched.companyName && errors.companyName ? 'is-invalid' : ''}`}
                                value={formData.companyName}
                                onChange={(e) => handleFieldChange('companyName', e.target.value)}
                                onBlur={() => handleFieldBlur('companyName')}
                                placeholder="Enter your company name"
                            />
                            {touched.companyName && errors.companyName && (
                                <div className="invalid-feedback d-block">
                                    {errors.companyName}
                                </div>
                            )}
                        </div>

                        {/* About Us */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">About Us *</label>
                            <textarea
                                className={`form-control ${touched.aboutUs && errors.aboutUs ? 'is-invalid' : ''}`}
                                value={formData.aboutUs}
                                onChange={(e) => handleFieldChange('aboutUs', e.target.value)}
                                onBlur={() => handleFieldBlur('aboutUs')}
                                placeholder="Tell us about your company..."
                                rows="6"
                                style={{ resize: 'vertical' }}
                            />
                            {touched.aboutUs && errors.aboutUs && (
                                <div className="invalid-feedback d-block">
                                    {errors.aboutUs}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="step-content">
                        <h4 className="step-title">Founding Information</h4>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Founded Year</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.foundedYear}
                                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                                    placeholder="e.g., 2010"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Company Size</label>
                                <select
                                    className="form-select"
                                    value={formData.companySize}
                                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                                >
                                    <option value="">Select company size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Industry</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.industry}
                                    onChange={(e) => handleInputChange('industry', e.target.value)}
                                    placeholder="e.g., Technology, Healthcare, Finance"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Headquarters</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.headquarters}
                                    onChange={(e) => handleInputChange('headquarters', e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="step-content">
                        <h4 className="step-title">Social Media Profiles</h4>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Website</label>
                            <input
                                type="url"
                                className="form-control"
                                value={formData.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                                placeholder="https://www.company.com"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">LinkedIn</label>
                            <input
                                type="url"
                                className="form-control"
                                value={formData.linkedin}
                                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                placeholder="https://www.linkedin.com/company/yourcompany"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Twitter</label>
                            <input
                                type="url"
                                className="form-control"
                                value={formData.twitter}
                                onChange={(e) => handleInputChange('twitter', e.target.value)}
                                placeholder="https://www.twitter.com/yourcompany"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Facebook</label>
                            <input
                                type="url"
                                className="form-control"
                                value={formData.facebook}
                                onChange={(e) => handleInputChange('facebook', e.target.value)}
                                placeholder="https://www.facebook.com/yourcompany"
                            />
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="step-content">
                        <h4 className="step-title">Contact Information</h4>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="contact@company.com"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="123 Business Street"
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    placeholder="New York"
                                />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">Country</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    placeholder="United States"
                                />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">Postal Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.postalCode}
                                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                    placeholder="10001"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mt-5">
            <div className="onboarding-container">
                {/* Page Title */}
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">
                        {editMode ? 'Edit Company Profile' : 'Company Profile Onboarding'}
                    </h2>
                    <p className="text-muted">
                        {editMode ? 'Update your company information' : 'Complete your company profile to attract top talent'}
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="stepper-wrapper">
                    <div className="stepper">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`step-item ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : ''}`}
                                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                            >
                                <div className="step-number">
                                    {currentStep > step.id ? (
                                        <Check size={16} className="check-icon" />
                                    ) : (
                                        <span>{step.id}</span>
                                    )}
                                </div>
                                <div className="step-info">
                                    <div className="step-icon">{step.icon}</div>
                                    <div className="step-name">{step.name}</div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`step-line ${currentStep > step.id ? 'completed' : ''}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="form-container">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="navigation-buttons">
                    {currentStep > 1 && (
                        <button className="btn btn-outline-secondary" onClick={handlePrevious}>
                            <ArrowLeft size={16} className="me-2" />
                            Previous
                        </button>
                    )}
                    <button
                        className="btn btn-primary ms-auto"
                        onClick={handleNext}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : currentStep === 4 ? (editMode ? 'Update Profile' : 'Submit') : 'Save & Next'}
                        {currentStep < 4 && <ArrowRight size={16} className="ms-2" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyOnboarding;
