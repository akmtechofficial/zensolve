import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './Pages/Home';
import Jobs from './Pages/Jobs';
import JobDetails from './components/JobDetails';
import ApplyJob from './components/ApplyJob';
import ThankYou from './components/ThankYou';
import SaveJob from './components/SaveJob';
import ContactUs from './Pages/ContactUs';
import Login from './components/Login';
import Register from './components/Register';
import CompanyProfile from './Pages/CompanyProfile';
import CompanyDirectory from './Pages/CompanyDirectory';

// Category Pages
import ITSoftware from './Pages/categories/ITSoftware';
import Construction from './Pages/categories/Construction';
import Finance from './Pages/categories/Finance';
import Healthcare from './Pages/categories/Healthcare';
import Education from './Pages/categories/Education';
import Business from './Pages/categories/Business';
import Teaching from './Pages/categories/Teaching';
import Logistics from './Pages/categories/Logistics';

// HR Dashboard Pages
import DashboardHome from './Pages/Dashboard/DashboardHome';
import DashboardJobs from './Pages/Dashboard/DashboardJobs';
import DashboardPostJob from './Pages/Dashboard/DashboardPostJob';
import DashboardApplicants from './Pages/Dashboard/DashboardApplicants';
import DashboardCompanyProfile from './Pages/Dashboard/DashboardCompanyProfile';

// Component to conditionally render Navbar and Footer based on route
const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {!isDashboard && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isDashboard && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Core Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job-details" element={<JobDetails />} />
            <Route path="/job-details/:id" element={<JobDetails />} />
            <Route
              path="/apply-job"
              element={
                <div className="py-12 px-4 max-w-2xl mx-auto">
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
                    <ApplyJob />
                  </div>
                </div>
              }
            />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/saved-jobs" element={<SaveJob />} />
            <Route path="/contactus" element={<ContactUs />} />

            {/* Companies Routes */}
            <Route path="/companies" element={<CompanyDirectory />} />
            <Route path="/company/:companyName" element={<CompanyProfile />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Category Discovery Routes */}
            <Route path="/categories/it-software" element={<ITSoftware />} />
            <Route path="/categories/construction" element={<Construction />} />
            <Route path="/categories/finance" element={<Finance />} />
            <Route path="/categories/healthcare" element={<Healthcare />} />
            <Route path="/categories/education" element={<Education />} />
            <Route path="/categories/business" element={<Business />} />
            <Route path="/categories/teaching" element={<Teaching />} />
            <Route path="/categories/logistics" element={<Logistics />} />

            {/* HR SaaS Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/jobs" element={<DashboardJobs />} />
            <Route path="/dashboard/post-job" element={<DashboardPostJob />} />
            <Route path="/dashboard/applicants" element={<DashboardApplicants />} />
            <Route path="/dashboard/company-profile" element={<DashboardCompanyProfile />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
