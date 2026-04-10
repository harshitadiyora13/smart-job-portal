import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import OTPVerification from "../components/OTPVerification";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/v1/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Save token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful");

      // Redirect based on user role
      if (res.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (res.data.user.role === "recruiter") {
        navigate("/dashboard/recruiter");
      } else {
        navigate("/dashboard/jobseeker");
      }
    } catch (error) {
      const errorData = error.response?.data;

      // If user needs verification, show OTP modal
      if (errorData?.requiresVerification) {
        setUnverifiedEmail(errorData.email || formData.email);
        setShowOTPVerification(true);
        toast.error("Please verify your email first");
      } else {
        toast.error(errorData?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = (data) => {
    toast.success("Account verified! Login successful.");

    // Store auth data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "admin") {
      navigate("/admin-dashboard");
    } else if (data.user.role === "recruiter") {
      navigate("/dashboard/recruiter");
    } else {
      navigate("/dashboard/jobseeker");
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* --- LOGIN CARD --- */}
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-body p-5">
                {/* --- HEADER --- */}
                <div className="text-center mb-5">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
                    <Briefcase size={36} />
                  </div>
                  <h2 className="fw-bold mb-3">Welcome Back</h2>
                  <p className="text-muted mb-0">Sign in to your JobFlow account</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* --- FORGOT PASSWORD LINK --- */}
                  <div className="text-end mb-4">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none fw-semibold text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* --- LOGIN BUTTON --- */}
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
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

                {/* --- REGISTER LINK --- */}
                <div className="text-center">
                  <span className="text-muted">
                    Don't have an account?{" "}
                  </span>
                  <Link
                    to="/register"
                    className="text-decoration-none fw-semibold text-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="text-center mt-4">
              <div className="d-inline-flex align-items-center gap-3 text-muted small">
                <span>&copy; 2024 SmartHire</span>
                <span>&bull;</span>
                <span>Secure Authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- OTP VERIFICATION MODAL --- */}
      {showOTPVerification && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-body p-4">
                <OTPVerification
                  email={unverifiedEmail}
                  onSuccess={handleVerificationSuccess}
                  onCancel={() => setShowOTPVerification(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
