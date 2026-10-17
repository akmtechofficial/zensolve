import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBriefcase, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { Button } from './ui/Button';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicantName, jobPosition, companyName } = location.state || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 mask-radial" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-lg text-center glass-panel bg-white/95 p-8 sm:p-12 rounded-3xl border border-emerald-500/30 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <FaCheckCircle size={32} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mb-2">
          Application Submitted!
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {applicantName ? `Thank you, ${applicantName}. ` : 'Thank you! '}
          Your resume and credentials have been forwarded directly to the hiring team for{' '}
          <strong className="text-slate-900 font-semibold">{jobPosition || 'the selected position'}</strong>
          {companyName ? ` at ${companyName}` : ''}.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 mb-8 text-left">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <FaShieldAlt className="text-indigo-600" />
            <span>What happens next?</span>
          </div>
          <p>
            1. The recruiter reviews your application and resume credentials.
          </p>
          <p>
            2. Shortlisted candidates receive an email or call to schedule preliminary interview rounds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/saved-jobs')}
          >
            View Saved Jobs
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<FaArrowRight className="text-xs" />}
            iconPosition="right"
            onClick={() => navigate('/jobs')}
          >
            Explore More Jobs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
