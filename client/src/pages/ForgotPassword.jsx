import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send, Lock, Eye, EyeOff, CheckCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('email'); // 'email', 'otp', 'password', 'success'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(5);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/v1/api/auth/forgot-password', { email });
            setStep('otp');
            toast.success("Reset code sent to your email!");
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMsg);
            if (error.response?.data?.cooldown) {
                setCooldown(error.response.data.cooldown);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        if (index === 5 && value) {
            const fullOtp = [...newOtp.slice(0, 5), value].join('');
            if (fullOtp.length === 6) {
                setTimeout(() => handleOtpVerify(fullOtp), 100);
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            setOtp(pastedData.split(''));
            inputRefs.current[5]?.focus();
            setTimeout(() => handleOtpVerify(pastedData), 100);
        }
    };

    const handleOtpVerify = async (fullOtp = null) => {
        const otpCode = fullOtp || otp.join('');
        if (otpCode.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/v1/api/auth/verify-reset-otp', {
                email,
                otp: otpCode
            });
            setStep('password');
            toast.success("Code verified! Enter your new password.");
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Verification failed';
            toast.error(errorMsg);
            if (error.response?.data?.remainingAttempts !== undefined) {
                setRemainingAttempts(error.response.data.remainingAttempts);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (cooldown > 0) return;
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/v1/api/auth/forgot-password', { email });
            setCooldown(60);
            setOtp(['', '', '', '', '', '']);
            setRemainingAttempts(5);
            inputRefs.current[0]?.focus();
            toast.success("New code sent!");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/v1/api/auth/reset-password', {
                email,
                password: formData.password,
                otp: otp.join('')
            });
            setStep('success');
            toast.success('Password reset successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
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

                        {step === 'email' && (
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
                                        No worries, we'll send you a reset code.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit}>
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
                                            "Send Reset Code"
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
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 'otp' && (
                            <>
                                <div className="text-center mb-4">
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                        style={{
                                            width: "64px",
                                            height: "64px",
                                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                        }}
                                    >
                                        <Mail size={28} className="text-white" />
                                    </div>
                                    <h2 className="fw-bold mb-2" style={{ fontSize: "24px" }}>
                                        Enter Reset Code
                                    </h2>
                                    <p className="text-muted mb-0 small">
                                        We sent a 6-digit code to<br />
                                        <strong>{email}</strong>
                                    </p>
                                </div>

                                {remainingAttempts < 5 && (
                                    <div className="alert alert-warning py-2 mb-3 small">
                                        {remainingAttempts} attempts remaining
                                    </div>
                                )}

                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            disabled={loading}
                                            className="form-control text-center fw-bold"
                                            style={{
                                                width: '45px',
                                                height: '50px',
                                                fontSize: '20px',
                                                borderRadius: '10px',
                                                border: '2px solid #e5e7eb'
                                            }}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleOtpVerify()}
                                    disabled={loading || otp.join('').length !== 6}
                                    className="btn btn-primary w-100 py-3 fw-semibold rounded-3 mb-3"
                                    style={{
                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                        border: "none"
                                    }}
                                >
                                    {loading ? (
                                        <div className="d-flex align-items-center justify-content-center">
                                            <div className="spinner-border spinner-border-sm me-2" role="status" />
                                            Verifying...
                                        </div>
                                    ) : (
                                        "Verify Code"
                                    )}
                                </button>

                                <div className="d-flex justify-content-between align-items-center">
                                    <button
                                        onClick={handleResendCode}
                                        disabled={loading || cooldown > 0}
                                        className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 small"
                                    >
                                        <RotateCcw size={14} />
                                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                                    </button>

                                    <button
                                        onClick={() => setStep('email')}
                                        className="btn btn-link text-muted text-decoration-none p-0 small"
                                    >
                                        Change Email
                                    </button>
                                </div>

                                <p className="text-center text-muted small mt-3 mb-0">
                                    Code expires in 10 minutes
                                </p>
                            </>
                        )}

                        {/* Step 3: New Password */}
                        {step === 'password' && (
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
                                        <Lock size={28} className="text-white" />
                                    </div>
                                    <h2 className="fw-bold mb-2" style={{ fontSize: "24px" }}>
                                        Set New Password
                                    </h2>
                                    <p className="text-muted mb-0 small">
                                        Create a strong password for your account
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">New Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <Lock size={16} className="text-muted" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control border-start-0 border-end-0"
                                                placeholder="Enter new password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                minLength={6}
                                                style={{ background: "#f8fafc" }}
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-light border-start-0"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small">Confirm Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <Lock size={16} className="text-muted" />
                                            </span>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control border-start-0 border-end-0"
                                                placeholder="Confirm new password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                required
                                                minLength={6}
                                                style={{ background: "#f8fafc" }}
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-light border-start-0"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                                            </button>
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
                                                <div className="spinner-border spinner-border-sm me-2" role="status" />
                                                Resetting...
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Step 4: Success */}
                        {step === 'success' && (
                            <div className="text-center py-3">
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
                                <h3 className="fw-bold mb-2">Password Reset!</h3>
                                <p className="text-muted mb-4 small">
                                    Your password has been successfully reset.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary w-100"
                                >
                                    Go to Login
                                </button>
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