import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Replace with your actual backend endpoint
            await axios.post('http://localhost:5000/v1/api/auth/forgot-password', { email });
            setIsSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-100 d-flex align-items-center justify-content-center px-3 py-4"
            style={{
                background:
                    "radial-gradient(1200px circle at 10% 10%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(900px circle at 90% 30%, rgba(34,197,94,0.14), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
            }}
        >
            <div className="w-100" style={{ maxWidth: 480 }}>
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                    <div className="card-body p-4 p-md-5">
                        {/* Back to Login */}
                        <Link
                            to="/login"
                            className="d-inline-flex align-items-center text-decoration-none mb-4"
                            style={{ color: "#64748b", fontSize: "14px" }}
                        >
                            <ArrowLeft size={16} className="me-2" />
                            Back to Login
                        </Link>

                        {!isSent ? (
                            <>
                                <div className="text-center mb-4">
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                        style={{
                                            width: "64px",
                                            height: "64px",
                                            background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)"
                                        }}
                                    >
                                        <Send size={28} className="text-white" />
                                    </div>
                                    <h2 className="fw-bold mb-2" style={{ fontSize: "28px" }}>
                                        Forgot Password?
                                    </h2>
                                    <p className="text-muted mb-0">
                                        No worries, we'll send you reset instructions.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Email Address
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <Mail size={18} className="text-muted" />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control border-start-0"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                style={{
                                                    background: "#f8fafc",
                                                    borderLeft: "none"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-100 py-3 fw-semibold rounded-3"
                                        style={{
                                            background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                                            border: "none"
                                        }}
                                    >
                                        {loading ? (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                Sending...
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        Remember your password?{' '}
                                        <Link to="/login" className="text-decoration-none fw-semibold">
                                            Sign In
                                        </Link>
                                    </small>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-3">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "64px",
                                        height: "64px",
                                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                    }}
                                >
                                    <Mail size={28} className="text-white" />
                                </div>
                                <h3 className="fw-bold mb-2">Check your email</h3>
                                <p className="text-muted mb-3">
                                    We sent a password reset link to<br />
                                    <span className="fw-semibold text-dark">{email}</span>
                                </p>
                                <div className="d-grid gap-2">
                                    <button
                                        onClick={() => setIsSent(false)}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Didn't receive the email? Click to retry
                                    </button>
                                    <Link to="/login" className="btn btn-secondary btn-sm">
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional UI Elements */}
                <div className="text-center mt-4">
                    <div className="d-inline-flex align-items-center gap-3 text-muted" style={{ fontSize: "14px" }}>
                        <span> 2024 JobFlow</span>
                        <span>•</span>
                        <span>Secure Password Recovery</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;