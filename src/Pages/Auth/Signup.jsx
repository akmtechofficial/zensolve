import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBuilding, FaArrowRight, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glass Texture & Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
            <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            ZenSolve
          </span>
        </Link>

        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 block w-max mx-auto mb-3">
          Join ZenSolve Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display mb-4">
          Choose Your Account Type
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto mb-12 leading-relaxed">
          Whether you are exploring executive career opportunities or scaling your organization with verified talent, select your pathway below.
        </p>

        {/* 2-Column Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Candidate Card */}
          <div className="glass-surface-3 glass-specular p-8 rounded-3xl border border-slate-200/90 shadow-xl flex flex-col justify-between hover:border-indigo-400 hover:shadow-2xl transition duration-300 relative group bg-white/95">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <FaUserGraduate />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display mb-2">
                I am a Job Seeker / Candidate
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Build your professional portfolio, bookmark roles, submit verified resumes, and track recruitment progress in real time.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>One-click applications with saved resume profile</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Real-time status tracker (Shortlisted, Interview, Offer)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                  <span>Access transparent salary benchmarks & verified employers</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/signup/candidate')}
              className="w-full shadow-md shadow-indigo-500/10 font-bold"
            >
              Sign Up as Candidate
            </Button>
          </div>

          {/* Company / Employer Card */}
          <div className="glass-surface-3 glass-specular p-8 rounded-3xl border border-slate-200/90 shadow-xl flex flex-col justify-between hover:border-indigo-400 hover:shadow-2xl transition duration-300 relative group bg-white/95">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <FaBuilding />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display mb-2">
                I am an Employer / HR Recruiter
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Register your organization, access ATS candidate pipelines, post verified vacancies, and schedule interviews efficiently.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-violet-500 flex-shrink-0" />
                  <span>Dedicated multi-company ATS recruitment console</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-violet-500 flex-shrink-0" />
                  <span>Interview scheduling & candidate stage management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-violet-500 flex-shrink-0" />
                  <span>Verified organization badge following admin approval</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/signup/company')}
              className="w-full shadow-sm font-bold bg-slate-900 text-white hover:bg-slate-800 border-none"
            >
              Register as Company
            </Button>
          </div>

        </div>

        {/* Existing user login link */}
        <p className="text-sm text-slate-600 mt-10">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-bold">
            Sign In here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
