import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import JobFeed from "./pages/JobFeed";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import JobseekerDashboard from "./pages/JobseekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import DashboardRedirect from "./components/DashboardRedirect";
import SavedJobs from "./pages/SavedJobs";
import Notifications from "./pages/Notifications";
import About from "./pages/About";
import Contact from "./pages/Contact";

// --- NEW IMPORTS ---
import JobDetails from "./pages/JobDetails";
import EditJob from "./pages/EditJob";
import ViewApplicants from "./pages/ViewApplicants";
import PostJob from "./pages/PostJob";
import ApplicantProfile from "./pages/ApplicantProfile";
import CompanyOnboarding from "./pages/CompanyOnboarding";
import CompanyProfile from "./pages/CompanyProfile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/company/:recruiterId"
          element={<CompanyProfile />}
        />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/jobs" element={<JobFeed />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Role-based dashboard redirect */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRedirect />
            </PrivateRoute>
          }
        />

        {/* Private Jobseeker Routes */}
        <Route
          path="/dashboard/jobseeker"
          element={
            <PrivateRoute allowedRoles={["jobseeker"]}>
              <JobseekerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <PrivateRoute allowedRoles={["jobseeker"]}>
              <MyApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/saved-jobs"
          element={
            <PrivateRoute allowedRoles={["jobseeker"]}>
              <SavedJobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute allowedRoles={["jobseeker", "recruiter"]}>
              <Notifications />
            </PrivateRoute>
          }
        />

        {/* Private Recruiter Routes */}
        <Route
          path="/dashboard/recruiter"
          element={
            <PrivateRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/company-onboarding"
          element={
            <PrivateRoute allowedRoles={["recruiter"]}>
              <CompanyOnboarding />
            </PrivateRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <PrivateRoute allowedRoles={["recruiter"]}>
              <PostJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-job/:id"
          element={
            <PrivateRoute allowedRoles={["recruiter"]}>
              <EditJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/view-applicants/:id"
          element={
            <PrivateRoute allowedRoles={["recruiter"]}>
              <ViewApplicants />
            </PrivateRoute>
          }
        />

        <Route
          path="/applicant/:id"
          element={
            <PrivateRoute allowedRoles={["recruiter"]}>
              <ApplicantProfile />
            </PrivateRoute>
          }
        />

        {/* Shared Private Routes */}
        <Route
          path="/job/:id"
          element={
            <PrivateRoute allowedRoles={["jobseeker", "recruiter"]}>
              <JobDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={["jobseeker", "recruiter"]}>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<h2 className="text-center mt-5">Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

// Separate component for root redirection
function RootRedirect() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user.role === "recruiter") {
    return <Navigate to="/dashboard/recruiter" replace />;
  } else {
    return <Navigate to="/dashboard/jobseeker" replace />;
  }
}

export default App;