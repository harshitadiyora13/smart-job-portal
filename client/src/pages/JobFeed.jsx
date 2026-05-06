import React, { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import { Search, MapPin, Filter } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const JobFeed = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await axios.get('http://localhost:5000/v1/api/jobs/all');
                setJobs(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                setJobs([]);
                setError(e.response?.data?.message || 'Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/v1/api/jobs/categories');
                setCategories(res.data.categories || []);
            } catch (e) {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Simple frontend filtering
    const filteredJobs = jobs
        .filter(job =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.company || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(job => {
            if (!selectedCategory) return true;
            return job.category && (job.category._id === selectedCategory);
        });

    return (
        <div className="min-vh-100 bg-light">
            <Navbar />
            <div className="container py-5">
                {/* Header & Search Bar */}
                <div className="mb-5 text-center">
                    <h1 className="display-4 fw-bold mb-4">Find Your Dream Job</h1>
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Search size={20} className="text-muted" />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0"
                                            placeholder="Job title or company..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button className="btn btn-primary text-white border-0" style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <select
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job List Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <div className="row g-4">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <div key={job._id} className="col-md-6">
                                    <JobCard job={job} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-info text-center">
                                    No jobs found matching your search.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobFeed;