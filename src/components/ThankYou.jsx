import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBriefcase, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { Button } from './ui/Button';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicantName, jobPosition, companyName } = location.state || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-lg text-center glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/30 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-glow-emerald">
          <FaCheckCircle size={32} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display mb-2">
          Application Submitted!
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {applicantName ? `Thank you, ${applicantName}. ` : 'Thank you! '}
          Your resume and credentials have been forwarded directly to the hiring team for{' '}
          <strong className="text-white">{jobPosition || 'the selected position'}</strong>
          {companyName ? ` at ${companyName}` : ''}.
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2 mb-8 text-left">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <FaShieldAlt className="text-indigo-400" />
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
