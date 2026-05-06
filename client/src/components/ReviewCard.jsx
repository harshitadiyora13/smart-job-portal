import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, User, Calendar, Flag, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, currentUser, onReviewUpdate, onReviewDelete, showActions = true }) => {
    const [helpful, setHelpful] = useState(review.helpful || false);
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
    const [isResponding, setIsResponding] = useState(false);
    const [response, setResponse] = useState(review.companyResponse || '');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.content);
    const [editRatings, setEditRatings] = useState({
        overallRating: review.overallRating || 0,
        workLifeBalance: review.workLifeBalance || 0,
        salaryBenefits: review.salaryBenefits || 0,
        careerGrowth: review.careerGrowth || 0,
        companyCulture: review.companyCulture || 0,
        management: review.management || 0,
        workEnvironment: review.workEnvironment || 0
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Component for editable star rating with half-star support
    const StarInput = ({ value, onChange, size = 16 }) => {
        const [hoverValue, setHoverValue] = useState(0);

        const handleClick = (e, starValue) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isHalf = x < rect.width / 2;
            const newValue = isHalf ? starValue - 0.5 : starValue;
            onChange(newValue);
        };

        const handleMouseMove = (e, starValue) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isHalf = x < rect.width / 2;
            setHoverValue(isHalf ? starValue - 0.5 : starValue);
        };

        return (
            <div className="d-flex gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                    const starValue = index + 1;
                    const displayValue = hoverValue || value;
                    const isFull = displayValue >= starValue;
                    const isHalf = !isFull && displayValue >= starValue - 0.5;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={(e) => handleClick(e, starValue)}
                            onMouseMove={(e) => handleMouseMove(e, starValue)}
                            onMouseLeave={() => setHoverValue(0)}
                            className="btn btn-link p-0 border-0 position-relative"
                            style={{ lineHeight: 0, width: size, height: size }}
                        >
                            {/* Background empty star */}
                            <Star
                                size={size}
                                className="text-muted"
                                fill="none"
                            />
                            {/* Half/Full star overlay */}
                            <div
                                className="position-absolute top-0 start-0 overflow-hidden"
                                style={{
                                    width: isFull ? '100%' : isHalf ? '50%' : '0%',
                                    height: '100%'
                                }}
                            >
                                <Star
                                    size={size}
                                    className="text-warning"
                                    fill="currentColor"
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderStars = (rating) => {
        const value = Number(rating || 0);
        return Array.from({ length: 5 }, (_, index) => {
            const star = index + 1;
            const isFull = value >= star;
            const isHalf = !isFull && value >= star - 0.5;
            return (
                <span key={index} className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: 16, height: 16 }}>
                    {/* Base empty star */}
                    <Star
                        size={16}
                        className="text-muted"
                        fill="none"
                    />
                    {/* Full star overlay */}
                    {isFull && (
                        <span className="position-absolute d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, width: 16, height: 16 }}>
                            <Star
                                size={16}
                                className="text-warning"
                                fill="currentColor"
                            />
                        </span>
                    )}
                    {/* Half star overlay using overflow container */}
                    {isHalf && (
                        <span className="position-absolute overflow-hidden d-flex align-items-center justify-content-start" style={{ top: 0, left: 0, width: 8, height: 16 }}>
                            <Star
                                size={16}
                                className="text-warning flex-shrink-0"
                                fill="currentColor"
                            />
                        </span>
                    )}
                </span>
            );
        });
    };

    const handleHelpful = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/v1/api/reviews/${review._id}/helpful`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHelpful(!helpful);
            setHelpfulCount(helpful ? helpfulCount - 1 : helpfulCount + 1);
        } catch (error) {
            console.error('Error marking review as helpful:', error);
        }
    };

    const handleReport = async () => {
        if (window.confirm('Are you sure you want to report this review?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`http://localhost:5000/v1/api/reviews/${review._id}/report`, { reason: 'other' }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Review reported successfully');
            } catch (error) {
                console.error('Error reporting review:', error);
                toast.error(error.response?.data?.message || 'Failed to report review');
            }
        }
    };

    const handleResponse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const result = await axios.post(`http://localhost:5000/v1/api/reviews/${review._id}/respond`, {
                response: response
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const savedResponse = result?.data?.review?.companyResponse ?? response;
            setResponse(savedResponse);

            if (typeof onReviewUpdate === 'function') {
                onReviewUpdate(review._id, { companyResponse: savedResponse });
            }
            setIsResponding(false);
            toast.success('Response posted successfully');
        } catch (error) {
            console.error('Error posting response:', error);
            toast.error('Failed to post response');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/v1/api/reviews/${review._id}`, {
                content: editContent,
                ...editRatings
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onReviewUpdate(review._id, {
                content: editContent,
                ...editRatings
            });
            setIsEditing(false);
            toast.success('Review updated successfully');
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/v1/api/reviews/${review._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                onReviewDelete(review._id);
                toast.success('Review deleted successfully');
            } catch (error) {
                console.error('Error deleting review:', error);
                toast.error('Failed to delete review');
            }
        }
    };

    const isOwner = currentUser && review.userId?._id === currentUser._id;
    const isCompanyOwner = currentUser && review.companyId === currentUser._id;

    return (
        <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-body">
                {/* Review Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <User size={24} className="text-primary" />
                        </div>
                        <div>
                            <h6 className="mb-0 fw-semibold">{review.userId?.name || 'Anonymous'}</h6>
                            <div className="d-flex align-items-center gap-2 text-muted small">
                                <Calendar size={14} />
                                <span>{formatDate(review.createdAt)}</span>
                                {review.isCurrentEmployee && (
                                    <span className="badge bg-success bg-opacity-10 text-success">Current Employee</span>
                                )}
                                {review.isFormerEmployee && (
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary">Former Employee</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <button
                            type="button"
                            className="btn btn-sm btn-light rounded-2"
                            onClick={handleReport}
                            aria-label="Report review"
                        >
                            <Flag size={16} />
                        </button>
                    )}
                </div>

                {/* Rating Categories */}
                <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="fw-semibold">Overall:</span>
                        <div className="d-flex align-items-center gap-1">
                            {isEditing ? (
                                <StarInput
                                    value={editRatings.overallRating}
                                    onChange={(val) => setEditRatings({ ...editRatings, overallRating: val })}
                                />
                            ) : (
                                <>
                                    {renderStars(review.overallRating)}
                                    <span className="ms-1 text-muted">({Number(review.overallRating).toFixed(1)})</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="row g-2">
                        <div className="col-6">
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted" style={{ minWidth: '70px' }}>Work-Life:</span>
                                <div className="d-flex">
                                    {isEditing ? (
                                        <StarInput
                                            value={editRatings.workLifeBalance}
                                            onChange={(val) => setEditRatings({ ...editRatings, workLifeBalance: val })}
                                        />
                                    ) : renderStars(review.workLifeBalance)}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted" style={{ minWidth: '70px' }}>Salary:</span>
                                <div className="d-flex">
                                    {isEditing ? (
                                        <StarInput
                                            value={editRatings.salaryBenefits}
                                            onChange={(val) => setEditRatings({ ...editRatings, salaryBenefits: val })}
                                        />
                                    ) : renderStars(review.salaryBenefits)}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted" style={{ minWidth: '70px' }}>Growth:</span>
                                <div className="d-flex">
                                    {isEditing ? (
                                        <StarInput
                                            value={editRatings.careerGrowth}
                                            onChange={(val) => setEditRatings({ ...editRatings, careerGrowth: val })}
                                        />
                                    ) : renderStars(review.careerGrowth)}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted" style={{ minWidth: '70px' }}>Culture:</span>
                                <div className="d-flex">
                                    {isEditing ? (
                                        <StarInput
                                            value={editRatings.companyCulture}
                                            onChange={(val) => setEditRatings({ ...editRatings, companyCulture: val })}
                                        />
                                    ) : renderStars(review.companyCulture)}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted" style={{ minWidth: '70px' }}>Management:</span>
                                <div className="d-flex">
                                    {isEditing ? (
                                        <StarInput
                                            value={editRatings.management}
                                            onChange={(val) => setEditRatings({ ...editRatings, management: val })}
                                        />
                                    ) : renderStars(review.management)}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted" style={{ minWidth: '70px' }}>Environment:</span>
                                <div className="d-flex">
                                    {isEditing ? (
                                        <StarInput
                                            value={editRatings.workEnvironment}
                                            onChange={(val) => setEditRatings({ ...editRatings, workEnvironment: val })}
                                        />
                                    ) : renderStars(review.workEnvironment)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Content */}
                <div className="mb-3">
                    {isEditing ? (
                        <form onSubmit={handleEdit}>
                            <textarea
                                className="form-control mb-2"
                                rows="3"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                required
                            />
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary btn-sm text-white border-0" style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>Save</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="mb-0">{review.content}</p>
                    )}
                </div>

                {/* Company Response */}
                {review.companyResponse && (
                    <div className="bg-light rounded-2 p-3 mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-1">
                                <MessageSquare size={16} className="text-primary" />
                            </div>
                            <span className="fw-semibold">Company Response</span>
                        </div>
                        <p className="mb-0 small">{review.companyResponse}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                        <button
                            className={`btn btn-sm d-flex align-items-center gap-1 ${helpful ? 'btn-primary text-white border-0' : 'btn-outline-primary'}`}
                            onClick={handleHelpful}
                            style={helpful ? { background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" } : {}}
                            onMouseEnter={e => helpful && (e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)')}
                            onMouseLeave={e => helpful && (e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)')}
                        >
                            <ThumbsUp size={14} />
                            Helpful {helpfulCount > 0 && `(${helpfulCount})`}
                        </button>
                    </div>

                    {showActions && (
                        <div className="d-flex gap-2">
                            {isOwner && (
                                <>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditing(true)}>
                                        <Edit size={14} />
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}

                            {isCompanyOwner && !review.companyResponse && (
                                <button className="btn btn-sm btn-primary text-white border-0" onClick={() => setIsResponding(true)} style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>
                                    <MessageSquare size={14} /> Respond
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Company Response Form */}
                {isResponding && isCompanyOwner && (
                    <form onSubmit={handleResponse} className="mt-3 pt-3 border-top">
                        <div className="mb-2">
                            <label className="form-label fw-semibold">Company Response</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Write a response to this review..."
                                required
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm text-white border-0" style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>Post Response</button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsResponding(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;
