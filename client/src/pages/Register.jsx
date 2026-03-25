import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Briefcase, Building } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (showSuccessModal && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSuccessModal, resendTimer]);

  // Resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await axios.post(
        "http://localhost:5000/v1/api/auth/resend-verification",
        { email: formData.email }
      );
      toast.success("Verification email resent successfully!");
      setResendTimer(60); // Reset timer
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  // Update form state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/v1/api/auth/register",
        formData
      );

      toast.success(res.data?.message || "Registration successful! Please verify your email.");
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* --- REGISTER CARD --- */}
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-body p-5">
                {/* --- HEADER --- */}
                <div className="text-center mb-5">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
                    <UserPlus size={36} />
                  </div>
                  <h2 className="fw-bold mb-3">Create Account</h2>
                  <p className="text-muted mb-0">Start your career journey with JobFlow</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* --- NAME INPUT --- */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Full Name
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-0">
                        <User size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="form-control bg-light border-0 ps-0"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* --- EMAIL INPUT --- */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Email Address
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-0">
                        <Mail size={20} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control bg-light border-0 ps-0"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* --- PASSWORD INPUT --- */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Password
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-0">
                        <Lock size={20} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control bg-light border-0 ps-0"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* --- ROLE SELECTION --- */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      I want to
                    </label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="jobseeker"
                        value="jobseeker"
                        checked={formData.role === "jobseeker"}
                        onChange={handleChange}
                      />
                      <label className="btn btn-outline-primary" htmlFor="jobseeker">
                        <Briefcase size={18} className="me-2" />
                        Find Jobs
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="recruiter"
                        value="recruiter"
                        checked={formData.role === "recruiter"}
                        onChange={handleChange}
                      />
                      <label className="btn btn-outline-primary" htmlFor="recruiter">
                        <Building size={18} className="me-2" />
                        Post Jobs
                      </label>
                    </div>
                  </div>

                  {/* --- REGISTER BUTTON --- */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 py-3 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {/* --- DIVIDER --- */}
                <div className="d-flex align-items-center my-5">
                  <div className="flex-grow-1 border-top"></div>
                  <span className="px-3 text-muted small">OR</span>
                  <div className="flex-grow-1 border-top"></div>
                </div>

                {/* --- LOGIN LINK --- */}
                <div className="text-center">
                  <span className="text-muted">
                    Already have an account?{" "}
                  </span>
                  <Link
                    to="/login"
                    className="text-decoration-none fw-semibold text-primary"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="text-center mt-4">
              <div className="d-inline-flex align-items-center gap-3 text-muted small">
                <span>&copy; 2026 SmartHire</span>
                <span>&bull;</span>
                <span>Secure Registration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-body p-5 text-center">
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
                  <UserPlus size={36} />
                </div>
                <h3 className="fw-bold mb-3">Registration Successful!</h3>
                <p className="text-muted mb-4">
                  We've sent a verification email to <strong>{formData.email}</strong>.
                  Please check your inbox and click the verification link to activate your account.
                </p>

                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/login")}
                  >
                    Go to Login
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleResendVerification}
                    disabled={isResending || resendTimer > 0}
                  >
                    {isResending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Resending...
                      </>
                    ) : resendTimer > 0 ? (
                      `Resend (${resendTimer}s)`
                    ) : (
                      "Resend Email"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
