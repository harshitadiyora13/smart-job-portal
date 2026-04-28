import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/v1/api/auth/resend-verification",
        { email }
      );

      setIsSent(true);
      toast.success(res.data?.message || "Verification email sent!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow border-0" style={{ maxWidth: 480, width: "100%" }}>
        <div className="card-body p-4 p-md-5">
          {/* Back to Login */}
          <Link to="/login" className="d-inline-flex align-items-center text-muted mb-4">
            <ArrowLeft size={18} className="me-2" />
            Back to Login
          </Link>

          {!isSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
                  style={{ width: 64, height: 64 }}
                >
                  <Mail size={30} className="text-primary" />
                </div>
                <h3 className="fw-bold">Resend Verification</h3>
                <p className="text-muted">
                  Didn't receive the verification email? Enter your email address
                  below and we'll send you a new one.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Mail size={18} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-semibold text-white border-0"
                  style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }}
                  onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'}
                  onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <Send size={18} className="me-2" />
                  )}
                  {loading ? "Sending..." : "Send Verification Email"}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-4 pt-3 border-top">
                <p className="mb-0 text-muted">
                  Remember your password?{" "}
                  <Link to="/login" className="fw-bold text-primary text-decoration-none">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3"
                  style={{ width: 64, height: 64 }}
                >
                  <CheckCircle size={30} className="text-success" />
                </div>
                <h3 className="fw-bold">Email Sent!</h3>
                <p className="text-muted mb-4">
                  We've sent a new verification email to:
                  <br />
                  <strong>{email}</strong>
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    onClick={() => setIsSent(false)}
                    className="btn btn-outline-primary"
                  >
                    Send Again
                  </button>
                  <Link to="/login" className="btn btn-primary text-white border-0" style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>
                    Go to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
