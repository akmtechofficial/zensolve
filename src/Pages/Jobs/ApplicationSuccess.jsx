import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  FaCheckCircle,
  FaArrowRight,
  FaBriefcase,
  FaShieldAlt,
  FaBuilding,
  FaCalendarCheck,
} from 'react-icons/fa';

const ApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    applicationId,
    jobPosition,
    companyName,
    applicantName,
    applicantEmail,
  } = location.state || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Texture & Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-lg mx-auto text-center">
        
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center">
            <img src="/zen.jpeg" alt="ZenSolve Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            ZenSolve
          </span>
        </Link>

        {/* Success Card */}
        <div className="glass-surface-3 glass-specular p-8 sm:p-12 rounded-3xl border border-emerald-500/30 shadow-2xl bg-white/95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaCheckCircle size={32} />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-2">
            Application Transmitted
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mb-2">
            Successfully Submitted!
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            {applicantName ? `Thank you, ${applicantName}. ` : 'Thank you! '}
            Your application for{' '}
            <strong className="text-slate-900 font-bold">{jobPosition || 'the selected position'}</strong>
            {companyName ? ` at ${companyName}` : ''} has been safely recorded in the employer's recruitment pipeline.
          </p>

          {applicationId && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-6 flex items-center justify-between">
              <span className="text-slate-500">Tracking Reference:</span>
              <span className="font-mono font-bold text-indigo-600">
                #{applicationId.slice(0, 10).toUpperCase()}
              </span>
            </div>
          )}

          {/* Next Steps Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 mb-8 text-left">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <FaShieldAlt className="text-indigo-600" />
              <span>What Happens Next?</span>
            </div>
            <p>
              1. <strong>Recruiter Review:</strong> The hiring team at {companyName || 'the employer'} evaluates candidate qualifications.
            </p>
            <p>
              2. <strong>Status Updates:</strong> Real-time progress updates appear on your candidate dashboard.
            </p>
            <p>
              3. <strong>Interview Invites:</strong> Shortlisted applicants receive direct scheduling invites.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/candidate/applications')}
              className="font-semibold"
            >
              Track in Applications
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/jobs')}
              className="font-semibold shadow-md shadow-indigo-500/10"
            >
              Browse More Jobs
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplicationSuccess;
