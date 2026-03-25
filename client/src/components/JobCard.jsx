import React from 'react';
import { MapPin, Briefcase, Building2, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
    const navigate = useNavigate();

    // Function to handle clicking "View Details"
    const handleViewDetails = () => {
        navigate(`/job/${job._id}`);
    };

    return (
        <div className="group bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            {/* Top Section: Logo and Title */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Building2 className="text-blue-600 h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {job?.title || "Job Title"}
                        </h3>
                        <p className="text-slate-500 font-medium">{job?.company?.name || "Company Name"}</p>
                    </div>
                </div>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {job?.jobType || "Full-Time"}
                </span>
            </div>

            {/* Middle Section: Stats/Location */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                <div className="flex items-center bg-slate-50 px-3 py-1 rounded-lg">
                    <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                    {job?.location || "Remote"}
                </div>
                <div className="flex items-center bg-slate-50 px-3 py-1 rounded-lg">
                    <Briefcase className="h-4 w-4 mr-1.5 text-slate-400" />
                    {job?.experienceLevel || "Entry Level"}
                </div>
                <div className="flex items-center bg-slate-50 px-3 py-1 rounded-lg">
                    <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                    {new Date(job?.createdAt).toLocaleDateString()}
                </div>
            </div>

            {/* Bottom Section: Description and Button */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <div className="text-slate-500 text-sm">
                    <span className="font-bold text-slate-900">₹{job?.salary || "0"}</span> / month
                </div>
                <button
                    onClick={handleViewDetails}
                    className="flex items-center space-x-1 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all active:scale-95"
                >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default JobCard;