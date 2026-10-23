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
import AuthCallback from './Pages/Auth/AuthCallback';

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
import AdminLegalCenter from './Pages/Admin/AdminLegalCenter';

// Legal & Compliance Pages
import LegalHub from './Pages/Legal/LegalHub';
import Terms from './Pages/Legal/Terms';
import Privacy from './Pages/Legal/Privacy';
import Cookies from './Pages/Legal/Cookies';
import Security from './Pages/Legal/Security';
import AcceptableUse from './Pages/Legal/AcceptableUse';
import CandidateTerms from './Pages/Legal/CandidateTerms';
import EmployerTerms from './Pages/Legal/EmployerTerms';
import DataRetention from './Pages/Legal/DataRetention';
import DataDeletion from './Pages/Legal/DataDeletion';
import ConsentPreferences from './Pages/Legal/ConsentPreferences';
import ReportFraud from './Pages/Legal/ReportFraud';
import Disclaimer from './Pages/Legal/Disclaimer';
import GrievanceRedressal from './Pages/Legal/GrievanceRedressal';
import Accessibility from './Pages/Legal/Accessibility';
import IntellectualProperty from './Pages/Legal/IntellectualProperty';
import CookieConsentBanner from './components/CookieConsentBanner';

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

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth') ||
    location.pathname === '/auth/callback';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {!isPanel && !isAuthPage && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isPanel && !isAuthPage && <Footer />}
      <CookieConsentBanner />
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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth" element={<Login />} />
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
                <ProtectedRoute requiredRole="company" requireApproved={true}>
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
            <Route
              path="/admin/legal"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLegalCenter />
                </ProtectedRoute>
              }
            />

            {/* =========================================================================
               6. LEGAL, PRIVACY & COMPLIANCE ROUTES
               ========================================================================= */}
            <Route path="/legal" element={<LegalHub />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/security" element={<Security />} />
            <Route path="/acceptable-use" element={<AcceptableUse />} />
            <Route path="/candidate-terms" element={<CandidateTerms />} />
            <Route path="/employer-terms" element={<EmployerTerms />} />
            <Route path="/data-retention" element={<DataRetention />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            <Route path="/consent-preferences" element={<ConsentPreferences />} />
            <Route path="/report-fraud" element={<ReportFraud />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/grievance-redressal" element={<GrievanceRedressal />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/intellectual-property" element={<IntellectualProperty />} />

            {/* =========================================================================
               7. CATEGORY DISCOVERY ROUTES
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
