import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(null); // null | true | false
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Verify token on component mount
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/v1/api/auth/reset-password/${token}`);
                setTokenValid(true);
            } catch (error) {
                setTokenValid(false);
                toast.error('Invalid or expired reset link');
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`http://localhost:5000/v1/api/auth/reset-password/${token}`, {
                password: formData.password
            });
            
            setIsSuccess(true);
            toast.success('Password reset successfully!');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while verifying token
    if (tokenValid === null) {
        return (
            <div
                className="min-vh-100 w-100 d-flex align-items-center justify-content-center px-3 py-4"
                style={{
                    background:
                        "radial-gradient(1200px circle at 10% 10%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(900px circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
                }}
            >
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h3 className="fw-bold">Verifying reset link...</h3>
                </div>
            </div>
        );
    }

    // Show error if token is invalid
    if (tokenValid === false) {
        return (
            <div
                className="min-vh-100 w-100 d-flex align-items-center justify-content-center px-3 py-4"
                style={{
                    background:
                        "radial-gradient(1200px circle at 10% 10%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(900px circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
                }}
            >
                <div className="w-100" style={{ maxWidth: 480 }}>
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-4 p-md-5 text-center">
                            <div 
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ 
                                    width: "64px", 
                                    height: "64px", 
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" 
                                }}
                            >
                                <XCircle size={28} className="text-white" />
                            </div>
                            <h3 className="fw-bold mb-2">Invalid Reset Link</h3>
                            <p className="text-muted mb-4">
                                This password reset link is invalid or has expired. Please request a new one.
                            </p>
                            <div className="d-grid gap-2">
                                <Link to="/forgot-password" className="btn btn-primary">
                                    Request New Reset Link
                                </Link>
                                <Link to="/login" className="btn btn-outline-secondary">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show success message
    if (isSuccess) {
        return (
            <div
                className="min-vh-100 w-100 d-flex align-items-center justify-content-center px-3 py-4"
                style={{
                    background:
                        "radial-gradient(1200px circle at 10% 10%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(900px circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
                }}
            >
                <div className="w-100" style={{ maxWidth: 480 }}>
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-4 p-md-5 text-center">
                            <div 
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ 
                                    width: "64px", 
                                    height: "64px", 
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                                }}
                            >
                                <CheckCircle size={28} className="text-white" />
                            </div>
                            <h3 className="fw-bold mb-2">Password Reset Successful!</h3>
                            <p className="text-muted mb-4">
                                Your password has been successfully reset. You will be redirected to the login page shortly.
                            </p>
                            <Link to="/login" className="btn btn-primary">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show reset password form
    return (
        <div
            className="min-vh-100 w-100 d-flex align-items-center justify-content-center px-3 py-4"
            style={{
                background:
                    "radial-gradient(1200px circle at 10% 10%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(900px circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
            }}
        >
            <div className="w-100" style={{ maxWidth: 500 }}>
                {/* Header */}
                <div className="text-center mb-5">
                    <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                        style={{ 
                            width: "80px", 
                            height: "80px", 
                            background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)" 
                        }}
                    >
                        <Lock size={36} className="text-white" />
                    </div>
                    <h1 className="fw-bold mb-3" style={{ fontSize: "32px" }}>
                        Reset Password
                    </h1>
                    <p className="text-muted mb-0" style={{ fontSize: "18px" }}>
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* New Password Input */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold text-dark" style={{ fontSize: "16px" }}>
                            New Password
                        </label>
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                                <Lock size={20} className="text-muted" />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-control border-start-0 border-end-0"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    background: "#f8fafc",
                                    borderLeft: "none",
                                    fontSize: "16px",
                                    padding: "12px 16px",
                                }}
                            />
                            <button
                                type="button"
                                className="input-group-text bg-light border-start-0"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                            >
                                {showPassword ? <EyeOff size={20} className="text-muted" /> : <Eye size={20} className="text-muted" />}
                            </button>
                        </div>
                        <small className="text-muted">Must be at least 6 characters long</small>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold text-dark" style={{ fontSize: "16px" }}>
                            Confirm New Password
                        </label>
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                                <Lock size={20} className="text-muted" />
                            </span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="form-control border-start-0 border-end-0"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    background: "#f8fafc",
                                    borderLeft: "none",
                                    fontSize: "16px",
                                    padding: "12px 16px",
                                }}
                            />
                            <button
                                type="button"
                                className="input-group-text bg-light border-start-0"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ cursor: "pointer" }}
                            >
                                {showConfirmPassword ? <EyeOff size={20} className="text-muted" /> : <Eye size={20} className="text-muted" />}
                            </button>
                        </div>
                    </div>

                    {/* Reset Password Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-100 py-3 fw-semibold rounded-3"
                        style={{
                            background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                            border: "none",
                            fontSize: "16px",
                            padding: "14px",
                        }}
                    >
                        {loading ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Resetting Password...
                            </div>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-4">
                    <Link 
                        to="/login" 
                        className="text-decoration-none fw-semibold"
                        style={{ color: "#3b82f6", fontSize: "16px" }}
                    >
                        Back to Login
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-5">
                    <div className="d-inline-flex align-items-center gap-3 text-muted" style={{ fontSize: "14px" }}>
                        <span>© 2024 JobFlow</span>
                        <span>•</span>
                        <span>Secure Password Reset</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
