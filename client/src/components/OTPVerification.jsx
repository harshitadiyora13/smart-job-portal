import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mail, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

const OTPVerification = ({ email, onSuccess, onCancel }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [remainingAttempts, setRemainingAttempts] = useState(5);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last character
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields filled
        if (index === 5 && value) {
            const fullOtp = [...newOtp.slice(0, 5), value].join('');
            if (fullOtp.length === 6) {
                setTimeout(() => handleVerify(fullOtp), 100);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Move with arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            setTimeout(() => handleVerify(pastedData), 100);
        } else {
            // Fill what we can
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length && i < 6; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleVerify = async (fullOtp = null) => {
        const otpCode = fullOtp || otp.join('');
        
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/v1/api/auth/verify-otp', {
                email,
                otp: otpCode
            });

            setSuccess('Verification successful!');
            
            // Store token and user data
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            setTimeout(() => {
                onSuccess(response.data);
            }, 1000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Verification failed';
            setError(errorMsg);
            
            if (err.response?.data?.remainingAttempts !== undefined) {
                setRemainingAttempts(err.response.data.remainingAttempts);
            }

            // Clear inputs on error
            if (err.response?.data?.remainingAttempts === 0) {
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;

        setResendLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/v1/api/auth/resend-otp', {
                email
            });

            setSuccess('New OTP sent!');
            setCooldown(30); // 30 seconds cooldown
            setOtp(['', '', '', '', '', '']); // Clear inputs
            inputRefs.current[0]?.focus();
            setRemainingAttempts(5); // Reset attempts

            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to resend OTP';
            setError(errorMsg);
            
            if (err.response?.data?.cooldown) {
                setCooldown(err.response.data.cooldown);
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ maxWidth: '450px', margin: '0 auto' }}>
            <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                    <Mail size={32} className="text-primary" />
                </div>
                <h4 className="fw-bold mb-2">Verify Your Email</h4>
                <p className="text-muted mb-0">
                    We've sent a 6-digit code to<br />
                    <strong>{email}</strong>
                </p>
            </div>

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                    <AlertCircle size={18} />
                    <span className="small">{error}</span>
                    {remainingAttempts < 5 && remainingAttempts > 0 && (
                        <span className="small ms-auto">{remainingAttempts} tries left</span>
                    )}
                </div>
            )}

            {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                    <CheckCircle size={18} />
                    <span className="small">{success}</span>
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
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={loading}
                        className="form-control text-center fw-bold fs-4 p-2"
                        style={{
                            width: '50px',
                            height: '56px',
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                ))}
            </div>

            <button
                onClick={() => handleVerify()}
                disabled={loading || otp.join('').length !== 6}
                className="btn btn-primary w-100 py-2 mb-3 fw-semibold"
            >
                {loading ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" />
                        Verifying...
                    </span>
                ) : (
                    'Verify OTP'
                )}
            </button>

            <div className="d-flex justify-content-between align-items-center">
                <button
                    onClick={handleResend}
                    disabled={resendLoading || cooldown > 0}
                    className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                >
                    <RotateCcw size={16} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="btn btn-link text-muted text-decoration-none p-0"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <p className="text-center text-muted small mt-3 mb-0">
                Code expires in 10 minutes
            </p>
        </div>
    );
};

export default OTPVerification;
