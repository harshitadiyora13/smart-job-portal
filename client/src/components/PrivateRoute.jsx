import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if user is authenticated
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "recruiter") {
            return <Navigate to="/dashboard/recruiter" replace />;
        } else {
            return <Navigate to="/dashboard/jobseeker" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
