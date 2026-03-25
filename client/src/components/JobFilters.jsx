import React, { useState } from "react";
import { Filter, X, ChevronDown, MapPin, Briefcase } from "lucide-react";

const JobFilters = ({ filters, onFiltersChange, onClearFilters }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleFilterChange = (filterName, value) => {
        onFiltersChange({
            ...filters,
            [filterName]: value
        });
    };

    const clearFilter = (filterName) => {
        onFiltersChange({
            ...filters,
            [filterName]: ''
        });
    };

    const hasActiveFilters = filters.location || filters.jobType || filters.company;

    return (
        <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <Filter size={18} /> Job Filters
                    </h6>
                    {hasActiveFilters && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={onClearFilters}
                        >
                            <X size={16} /> Clear All
                        </button>
                    )}
                </div>

                {/* Basic Filters */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Location</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                                <MapPin size={16} className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder="City, State, or Remote"
                                value={filters.location || ''}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            />
                            {filters.location && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => clearFilter('location')}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Job Type</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                                <Briefcase size={16} className="text-muted" />
                            </span>
                            <select
                                className="form-select bg-light border-0"
                                value={filters.jobType || ''}
                                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Remote">Remote</option>
                            </select>
                            {filters.jobType && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => clearFilter('jobType')}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                    className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                </button>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="border-top pt-3">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Company</label>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    placeholder="Filter by company name"
                                    value={filters.company || ''}
                                    onChange={(e) => handleFilterChange('company', e.target.value)}
                                />
                                {filters.company && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => clearFilter('company')}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Posted Date Range */}
                        <div className="row g-3 mt-3">
                            <div className="col-md-12">
                                <label className="form-label fw-semibold">Posted Within</label>
                                <select
                                    className="form-select bg-light border-0"
                                    value={filters.postedWithin || ''}
                                    onChange={(e) => handleFilterChange('postedWithin', e.target.value)}
                                >
                                    <option value="">Any Time</option>
                                    <option value="1">Last 24 hours</option>
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="border-top pt-3 mt-3">
                        <small className="text-muted fw-semibold">Active Filters:</small>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {filters.location && (
                                <span className="badge bg-primary d-flex align-items-center gap-1">
                                    <MapPin size={12} /> {filters.location}
                                    <button
                                        className="btn btn-sm btn-link text-white p-0"
                                        onClick={() => clearFilter('location')}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                            {filters.jobType && (
                                <span className="badge bg-info d-flex align-items-center gap-1">
                                    <Briefcase size={12} /> {filters.jobType}
                                    <button
                                        className="btn btn-sm btn-link text-white p-0"
                                        onClick={() => clearFilter('jobType')}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                            {filters.company && (
                                <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                                    Company: {filters.company}
                                    <button
                                        className="btn btn-sm btn-link text-dark p-0"
                                        onClick={() => clearFilter('company')}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobFilters;
