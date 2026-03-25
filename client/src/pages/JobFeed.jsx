import React, { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import { Search, MapPin, Filter } from 'lucide-react';
import axios from 'axios';

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
        <div className="bg-slate-50 min-h-screen pt-8 pb-20">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header & Search Bar */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Find Your Dream Job</h1>
                    <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-slate-100">

                        <div className="flex-1 flex items-center px-4 border-r border-slate-100">
                            <Search className="text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Job title or company..."
                                className="w-full py-3 outline-none text-slate-700"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            Search
                        </button>
                    </div>

                    <div className="max-w-3xl mx-auto mt-4">
                        <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
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

                {/* Job List Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <p className="text-center text-slate-500 py-10">{error}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <JobCard key={job._id} job={job} />
                            ))
                        ) : (
                            <p className="text-center col-span-2 text-slate-500 py-10">No jobs found matching your search.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobFeed;