import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './Pages/Home';
import Jobs from './Pages/Jobs';
import JobDetails from './components/JobDetails';
import JobApplyPage from './Pages/Jobs/JobApplyPage';
import ApplicationSuccess from './Pages/Jobs/ApplicationSuccess';
import ApplyJob from './components/ApplyJob';
import ThankYou from './components/ThankYou';
import SaveJob from './components/SaveJob';
import ContactUs from './Pages/ContactUs';
import CompanyProfile from './Pages/CompanyProfile';
import CompanyDirectory from './Pages/CompanyDirectory';

// Auth Pages
import Login from './components/Login';
import Register from './components/Register';
import Signup from './Pages/Auth/Signup';
import CandidateSignup from './Pages/Auth/CandidateSignup';
import CompanySignup from './Pages/Auth/CompanySignup';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import VerifyEmail from './Pages/Auth/VerifyEmail';

// Candidate Panel
import CandidateHome from './Pages/Candidate/CandidateHome';
import CandidateProfile from './Pages/Candidate/CandidateProfile';
import CandidateResume from './Pages/Candidate/CandidateResume';
import CandidateApplications from './Pages/Candidate/CandidateApplications';
import CandidateApplicationDetail from './Pages/Candidate/CandidateApplicationDetail';
import CandidateSavedJobs from './Pages/Candidate/CandidateSavedJobs';
import CandidateSettings from './Pages/Candidate/CandidateSettings';

// HR Company Panel
import DashboardHome from './Pages/Dashboard/DashboardHome';
import DashboardJobs from './Pages/Dashboard/DashboardJobs';
import DashboardPostJob from './Pages/Dashboard/DashboardPostJob';
import DashboardApplicants from './Pages/Dashboard/DashboardApplicants';
import DashboardCompanyProfile from './Pages/Dashboard/DashboardCompanyProfile';
import HRApplicantDetail from './Pages/HR/HRApplicantDetail';
import HRSettings from './Pages/HR/HRSettings';

// Super-Admin Panel
import AdminHome from './Pages/Admin/AdminHome';
import AdminCompanies from './Pages/Admin/AdminCompanies';
import AdminCompanyDetail from './Pages/Admin/AdminCompanyDetail';
import AdminUsers from './Pages/Admin/AdminUsers';
import AdminJobs from './Pages/Admin/AdminJobs';
import AdminApplications from './Pages/Admin/AdminApplications';
import AdminReports from './Pages/Admin/AdminReports';
import AdminSettings from './Pages/Admin/AdminSettings';

// Category Discovery Pages
import ITSoftware from './Pages/categories/ITSoftware';
import Construction from './Pages/categories/Construction';
import Finance from './Pages/categories/Finance';
import Healthcare from './Pages/categories/Healthcare';
import Education from './Pages/categories/Education';
import Business from './Pages/categories/Business';
import Teaching from './Pages/categories/Teaching';
import Logistics from './Pages/categories/Logistics';

// Conditional Navbar/Footer Layout
const Layout = ({ children }) => {
  const location = useLocation();
  const isPanel =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/candidate') ||
    location.pathname.startsWith('/hr') ||
    location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {!isPanel && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isPanel && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* =========================================================================
               1. PUBLIC & JOB APPLICATION EXPERIENCE
               ========================================================================= */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/jobs/:jobId/apply" element={<JobApplyPage />} />
            <Route path="/application-success" element={<ApplicationSuccess />} />
            
            {/* Backward compatibility aliases */}
            <Route path="/job-details" element={<JobDetails />} />
            <Route path="/job-details/:id" element={<JobDetails />} />
            <Route path="/apply-job" element={<ApplyJob />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/saved-jobs" element={<SaveJob />} />
            <Route path="/contactus" element={<ContactUs />} />

            {/* Companies Public Directory & Profiles */}
            <Route path="/companies" element={<CompanyDirectory />} />
            <Route path="/company/:companyName" element={<CompanyProfile />} />

            {/* =========================================================================
               2. AUTHENTICATION ROUTES
               ========================================================================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/candidate" element={<CandidateSignup />} />
            <Route path="/signup/company" element={<CompanySignup />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* =========================================================================
               3. CANDIDATE PROTECTED PANEL
               ========================================================================= */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/profile"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/resume"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateResume />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications/:applicationId"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateApplicationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/saved-jobs"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateSavedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/settings"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateSettings />
                </ProtectedRoute>
              }
            />

            {/* =========================================================================
               4. HR / COMPANY PROTECTED PANEL
               ========================================================================= */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/jobs"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/jobs/new"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardPostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/jobs/:jobId/edit"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardPostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/jobs/:jobId/applicants"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/applicants"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/applicants/:applicationId"
              element={
                <ProtectedRoute requiredRole="company">
                  <HRApplicantDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/profile"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardCompanyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/settings"
              element={
                <ProtectedRoute requiredRole="company">
                  <HRSettings />
                </ProtectedRoute>
              }
            />

            {/* Legacy Dashboard Route Aliases for backwards compatibility */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/jobs"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/post-job"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardPostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/applicants"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/company-profile"
              element={
                <ProtectedRoute requiredRole="company">
                  <DashboardCompanyProfile />
                </ProtectedRoute>
              }
            />

            {/* =========================================================================
               5. SUPER-ADMIN PROTECTED PANEL
               ========================================================================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCompanies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/:companyId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCompanyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* =========================================================================
               6. CATEGORY DISCOVERY ROUTES
               ========================================================================= */}
            <Route path="/categories/it-software" element={<ITSoftware />} />
            <Route path="/categories/construction" element={<Construction />} />
            <Route path="/categories/finance" element={<Finance />} />
            <Route path="/categories/healthcare" element={<Healthcare />} />
            <Route path="/categories/education" element={<Education />} />
            <Route path="/categories/business" element={<Business />} />
            <Route path="/categories/teaching" element={<Teaching />} />
            <Route path="/categories/logistics" element={<Logistics />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
