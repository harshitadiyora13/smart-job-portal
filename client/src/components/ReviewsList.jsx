import React, { useState, useEffect } from 'react';
import { Star, Filter, SortDesc, BarChart3, TrendingUp } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import axios from 'axios';

const ReviewsList = ({ companyId, currentUser, isCompanyOwner = false }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [filter, setFilter] = useState('all'); // all, current, former, interview
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest, helpful
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (companyId) {
            fetchReviews();
            fetchReviewStats();
        }
    }, [companyId, filter, sortBy]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            console.log('Fetching reviews for companyId:', companyId);

            const response = await axios.get(`http://localhost:5000/v1/api/reviews/company/${companyId}`, {
                params: { filter, sortBy },
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Reviews response:', response.data);
            // The response should have a 'reviews' property
            const reviewsData = response.data.reviews || response.data || [];
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Failed to fetch reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewStats = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            console.log('Fetching review stats for companyId:', companyId);

            const response = await axios.get(`http://localhost:5000/v1/api/reviews/stats/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Stats response:', response.data);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching review stats:', error);
            // Don't set error for stats, just set to null
            setStats(null);
        }
    };

    const handleReviewSubmitted = (newReview) => {
        setReviews(prev => [newReview, ...prev]);
        setShowReviewForm(false);
        fetchReviewStats(); // Refresh stats
    };

    const handleReviewUpdate = (reviewId, updatedData) => {
        setReviews(prev => prev.map(review =>
            review._id === reviewId ? { ...review, ...updatedData } : review
        ));
        fetchReviewStats(); // Refresh stats
    };

    const handleReviewDelete = (reviewId) => {
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        fetchReviewStats(); // Refresh stats
    };

    const renderStars = (rating, size = 16) => {
        const value = Number(rating || 0);
        return Array.from({ length: 5 }, (_, index) => {
            const star = index + 1;
            const isFull = value >= star;
            const isHalf = !isFull && value >= star - 0.5;
            const halfWidth = size / 2;
            return (
                <span key={index} className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
                    {/* Base empty star */}
                    <Star
                        size={size}
                        className="text-muted"
                        fill="none"
                    />
                    {/* Full star overlay */}
                    {isFull && (
                        <span className="position-absolute d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, width: size, height: size }}>
                            <Star
                                size={size}
                                className="text-warning"
                                fill="currentColor"
                            />
                        </span>
                    )}
                    {/* Half star overlay using overflow container */}
                    {isHalf && (
                        <span className="position-absolute overflow-hidden d-flex align-items-center justify-content-start" style={{ top: 0, left: 0, width: halfWidth, height: size }}>
                            <Star
                                size={size}
                                className="text-warning flex-shrink-0"
                                fill="currentColor"
                            />
                        </span>
                    )}
                </span>
            );
        });
    };

    const getFilterLabel = (filterValue) => {
        switch (filterValue) {
            case 'current': return 'Current Employees';
            case 'former': return 'Former Employees';
            case 'interview': return 'Interview Candidates';
            default: return 'All Reviews';
        }
    };

    const getSortLabel = (sortValue) => {
        switch (sortValue) {
            case 'oldest': return 'Oldest First';
            case 'highest': return 'Highest Rated';
            case 'lowest': return 'Lowest Rated';
            case 'helpful': return 'Most Helpful';
            default: return 'Newest First';
        }
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading reviews...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <Star size={48} className="text-danger mb-3" />
                <h5 className="text-danger">Error Loading Reviews</h5>
                <p className="text-muted">{error}</p>
                <button className="btn btn-primary text-white border-0" onClick={() => {
                    setError(null);
                    fetchReviews();
                    fetchReviewStats();
                }} style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="reviews-section">
            {/* Review Form - Only for job seekers */}
            {(!isCompanyOwner && currentUser && currentUser.role === 'jobseeker') && (
                <div className="mb-4">
                    {!showReviewForm ? (
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2 text-white border-0"
                            onClick={() => setShowReviewForm(true)}
                            style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }}
                            onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'}
                            onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}
                        >
                            <Star size={16} />
                            Write a Review
                        </button>
                    ) : (
                        <ReviewForm
                            companyId={companyId}
                            currentUser={currentUser}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    )}
                </div>
            )}

            {/* Filters and Sorting */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2">
                    <div className="dropdown">
                        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" data-bs-toggle="dropdown">
                            <Filter size={14} />
                            {getFilterLabel(filter)}
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => setFilter('all')}>All Reviews</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilter('current')}>Current Employees</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilter('former')}>Former Employees</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilter('interview')}>Interview Candidates</button></li>
                        </ul>
                    </div>

                    <div className="dropdown">
                        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" data-bs-toggle="dropdown">
                            <SortDesc size={14} />
                            {getSortLabel(sortBy)}
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => setSortBy('newest')}>Newest First</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortBy('oldest')}>Oldest First</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortBy('highest')}>Highest Rated</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortBy('lowest')}>Lowest Rated</button></li>
                            <li><button className="dropdown-item" onClick={() => setSortBy('helpful')}>Most Helpful</button></li>
                        </ul>
                    </div>
                </div>

                <div className="text-muted small">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
            </div>

            {/* Simple Empty State */}
            {reviews.length === 0 && (
                <div className="text-center py-4">
                    <Star size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No Reviews Yet</h5>
                </div>
            )}

            {reviews.length > 0 && (
                <div className="d-flex flex-column gap-3">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            currentUser={currentUser}
                            onReviewUpdate={handleReviewUpdate}
                            onReviewDelete={handleReviewDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
