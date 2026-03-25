import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    React.useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin-dashboard');
        } else if (user?.role === 'recruiter') {
            navigate('/dashboard/recruiter');
        } else if (user?.role === 'jobseeker') {
            navigate('/dashboard/jobseeker');
        } else {
            navigate('/login');
        }
    }, [navigate, user?.role]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardRedirect;
