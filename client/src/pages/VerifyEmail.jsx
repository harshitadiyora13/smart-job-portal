import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/v1/api/auth/verify-email/${token}`
        );

        if (!isMounted) return;

        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully!");
        toast.success("Email verified successfully!");
      } catch (error) {
        if (!isMounted) return;

        setStatus("error");
        const msg =
          error.response?.data?.message ||
          "Invalid or expired verification link. Please register again.";
        setMessage(msg);
        toast.error(msg);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow border-0" style={{ maxWidth: 520, width: "100%" }}>
        <div className="card-body p-4 p-md-5 text-center">
          {status === "loading" && (
            <>
              <div className="d-flex justify-content-center mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
              <h3 className="fw-bold mb-2">Verifying Email</h3>
              <p className="text-muted mb-0">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="d-flex justify-content-center mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                  <CheckCircle2 className="text-success" size={44} />
                </div>
              </div>
              <h3 className="fw-bold mb-2">Email Verified</h3>
              <p className="text-muted">{message}</p>
              <Link to="/login" className="btn btn-primary px-4">
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="d-flex justify-content-center mb-3">
                <div className="rounded-circle bg-danger bg-opacity-10 p-3">
                  <XCircle className="text-danger" size={44} />
                </div>
              </div>
              <h3 className="fw-bold mb-2">Invalid Link</h3>
              <p className="text-muted">{message}</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/login" className="btn btn-primary px-4">
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
