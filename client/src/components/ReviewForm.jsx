import React, { useState } from 'react';
import { Star, Send, Briefcase, Calendar, User, ChevronDown } from 'lucide-react';
import axios from 'axios';

const ReviewForm = ({ companyId, onReviewSubmitted, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        overallRating: 5,
        workLifeBalance: 5,
        salaryBenefits: 5,
        careerGrowth: 5,
        companyCulture: 5,
        management: 5,
        workEnvironment: 5,
        content: '',
        jobTitle: '',
        employmentStatus: 'current', // current, former, interview
        employmentDates: {
            startMonth: '',
            startYear: '',
            endMonth: '',
            endYear: ''
        }
    });
    const [errors, setErrors] = useState({});
    const [hoverRating, setHoverRating] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.content.trim()) {
            newErrors.content = 'Review content is required';
        } else if (formData.content.trim().length < 50) {
            newErrors.content = 'Review must be at least 50 characters';
        } else if (formData.content.trim().length > 2000) {
            newErrors.content = 'Review must be less than 2000 characters';
        }

        if (!formData.jobTitle.trim()) {
            newErrors.jobTitle = 'Job title is required';
        }

        if (formData.employmentStatus === 'current' && (!formData.employmentDates.startMonth || !formData.employmentDates.startYear)) {
            newErrors.startDate = 'Start date is required';
        }

        if (formData.employmentStatus === 'former' &&
            (!formData.employmentDates.startMonth || !formData.employmentDates.startYear ||
                !formData.employmentDates.endMonth || !formData.employmentDates.endYear)) {
            newErrors.dates = 'Both start and end dates are required for former employees';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Format dates properly
            const startDate = formData.employmentDates.startYear && formData.employmentDates.startMonth
                ? `${formData.employmentDates.startYear}-${formData.employmentDates.startMonth}-01`
                : '';
            const endDate = formData.employmentDates.endYear && formData.employmentDates.endMonth
                ? `${formData.employmentDates.endYear}-${formData.employmentDates.endMonth}-01`
                : '';

            const reviewData = {
                companyId,
                ...formData,
                startDate,
                endDate,
                isCurrentEmployee: formData.employmentStatus === 'current',
                isFormerEmployee: formData.employmentStatus === 'former',
                employmentDates: undefined // Remove the nested object
            };

            console.log('Submitting review:', reviewData);

            const response = await axios.post('http://localhost:5000/v1/api/reviews', reviewData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Review submitted successfully!');
            onReviewSubmitted(response.data);

            // Reset form
            setFormData({
                overallRating: 5,
                workLifeBalance: 5,
                salaryBenefits: 5,
                careerGrowth: 5,
                companyCulture: 5,
                management: 5,
                workEnvironment: 5,
                content: '',
                jobTitle: '',
                employmentStatus: 'current',
                employmentDates: {
                    startMonth: '',
                    startYear: '',
                    endMonth: '',
                    endYear: ''
                }
            });
            setErrors({});

        } catch (error) {
            console.error('Error submitting review:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (category, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleRatingHover = (category, value) => {
        setHoverRating(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleRatingHoverLeave = (category) => {
        setHoverRating(prev => ({
            ...prev,
            [category]: null
        }));
    };

    const renderRatingStars = (category, label) => {
        const currentValue = Number(formData[category]) || 0;
        const hoverValue = hoverRating[category];
        const previewValue = hoverValue !== null && hoverValue !== undefined ? hoverValue : currentValue;
        const displayValue = previewValue % 1 === 0 ? `${previewValue}.0` : previewValue;

        return (
            <div className="mb-3">
                <label className="form-label fw-semibold">{label}</label>
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isFull = previewValue >= star;
                            const isHalf = !isFull && previewValue >= star - 0.5;
                            const starColor = hoverValue !== null && hoverValue !== undefined ? 'text-info' : 'text-warning';

                            return (
                                <div
                                    key={star}
                                    className="position-relative"
                                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                                    onMouseLeave={() => handleRatingHoverLeave(category)}
                                >
                                    {/* Base empty star */}
                                    <Star
                                        size={20}
                                        className="text-muted"
                                        fill="none"
                                    />
                                    {/* Full star overlay */}
                                    {isFull && (
                                        <Star
                                            size={20}
                                            className={`${starColor} position-absolute top-0 start-0`}
                                            fill="currentColor"
                                        />
                                    )}
                                    {/* Half star overlay using overflow container */}
                                    {isHalf && (
                                        <span className={`position-absolute top-0 start-0 overflow-hidden ${starColor}`} style={{ width: 10, height: 20 }}>
                                            <Star
                                                size={20}
                                                fill="currentColor"
                                            />
                                        </span>
                                    )}
                                    {/* Click zones: left half = -0.5, right half = full */}
                                    <div className="position-absolute top-0 start-0 d-flex" style={{ width: 20, height: 20 }}>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none"
                                            style={{ width: 10, height: 20, opacity: 0 }}
                                            onClick={() => handleRatingChange(category, star - 0.5)}
                                            onMouseEnter={() => handleRatingHover(category, star - 0.5)}
                                            title={`${star - 0.5} stars`}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none"
                                            style={{ width: 10, height: 20, opacity: 0 }}
                                            onClick={() => handleRatingChange(category, star)}
                                            onMouseEnter={() => handleRatingHover(category, star)}
                                            title={`${star} stars`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <span className={`${hoverValue !== null && hoverValue !== undefined ? 'text-info fw-semibold' : 'text-muted'}`}>
                        ({displayValue})
                    </span>
                </div>
            </div>
        );
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= currentYear - 50; year--) {
            years.push(year);
        }
        return years;
    };

    const generateMonthOptions = () => {
        return [
            { value: '01', label: 'January' },
            { value: '02', label: 'February' },
            { value: '03', label: 'March' },
            { value: '04', label: 'April' },
            { value: '05', label: 'May' },
            { value: '06', label: 'June' },
            { value: '07', label: 'July' },
            { value: '08', label: 'August' },
            { value: '09', label: 'September' },
            { value: '10', label: 'October' },
            { value: '11', label: 'November' },
            { value: '12', label: 'December' }
        ];
    };

    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body">
                <h5 className="card-title mb-4">
                    <Star className="text-warning me-2" />
                    Write a Review
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Employment Information */}
                    <div className="row mb-4">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                                <Briefcase size={16} className="me-1" />
                                Job Title *
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.jobTitle ? 'is-invalid' : ''}`}
                                placeholder="e.g. Senior Frontend Developer"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                            />
                            {errors.jobTitle && (
                                <div className="invalid-feedback">{errors.jobTitle}</div>
                            )}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                                <User size={16} className="me-1" />
                                Employment Status
                            </label>
                            <select
                                className="form-select"
                                value={formData.employmentStatus}
                                onChange={(e) => setFormData(prev => ({ ...prev, employmentStatus: e.target.value }))}
                            >
                                <option value="current">Current Employee</option>
                                <option value="former">Former Employee</option>
                                <option value="interview">Interview Candidate</option>
                            </select>
                        </div>

                        {(formData.employmentStatus === 'current' || formData.employmentStatus === 'former') && (
                            <>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        <Calendar size={16} className="me-1" />
                                        Start Date *
                                    </label>
                                    <div className="d-flex gap-2">
                                        <select
                                            className={`form-select ${errors.startDate || errors.dates ? 'is-invalid' : ''}`}
                                            value={formData.employmentDates.startMonth}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                employmentDates: { ...prev.employmentDates, startMonth: e.target.value }
                                            }))}
                                        >
                                            <option value="">Month</option>
                                            {generateMonthOptions().map(month => (
                                                <option key={month.value} value={month.value}>{month.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            className={`form-select ${errors.startDate || errors.dates ? 'is-invalid' : ''}`}
                                            value={formData.employmentDates.startYear}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                employmentDates: { ...prev.employmentDates, startYear: e.target.value }
                                            }))}
                                        >
                                            <option value="">Year</option>
                                            {generateYearOptions().map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(errors.startDate || errors.dates) && (
                                        <div className="invalid-feedback">{errors.startDate || errors.dates}</div>
                                    )}
                                </div>

                                {formData.employmentStatus === 'former' && (
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">
                                            <Calendar size={16} className="me-1" />
                                            End Date *
                                        </label>
                                        <div className="d-flex gap-2">
                                            <select
                                                className={`form-select ${errors.dates ? 'is-invalid' : ''}`}
                                                value={formData.employmentDates.endMonth}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    employmentDates: { ...prev.employmentDates, endMonth: e.target.value }
                                                }))}
                                            >
                                                <option value="">Month</option>
                                                {generateMonthOptions().map(month => (
                                                    <option key={month.value} value={month.value}>{month.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                className={`form-select ${errors.dates ? 'is-invalid' : ''}`}
                                                value={formData.employmentDates.endYear}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    employmentDates: { ...prev.employmentDates, endYear: e.target.value }
                                                }))}
                                            >
                                                <option value="">Year</option>
                                                {generateYearOptions().map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.dates && (
                                            <div className="invalid-feedback">{errors.dates}</div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Rating Categories */}
                    <div className="mb-4">
                        <h6 className="fw-semibold mb-3">Rate Your Experience</h6>

                        {renderRatingStars('overallRating', 'Overall Experience')}

                        <div className="row">
                            <div className="col-md-6">
                                {renderRatingStars('workLifeBalance', 'Work-Life Balance')}
                                {renderRatingStars('salaryBenefits', 'Salary & Benefits')}
                                {renderRatingStars('careerGrowth', 'Career Growth')}
                            </div>
                            <div className="col-md-6">
                                {renderRatingStars('companyCulture', 'Company Culture')}
                                {renderRatingStars('management', 'Management')}
                                {renderRatingStars('workEnvironment', 'Work Environment')}
                            </div>
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Your Review *</label>
                        <textarea
                            className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                            rows="5"
                            placeholder="Share your experience at this company. What did you like? What could be improved? Be specific and helpful to others."
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        />
                        {errors.content && (
                            <div className="invalid-feedback">{errors.content}</div>
                        )}
                        <div className="form-text">
                            Minimum 50 characters. Maximum 2000 characters.
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Your review will be public and visible to all users
                        </small>
                        <button
                            type="submit"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" />
                            ) : (
                                <Send size={16} />
                            )}
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
