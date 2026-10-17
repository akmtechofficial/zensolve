import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getApplicationById,
  withdrawApplication,
} from '../../services/recruitmentService';
import CandidateLayout from './CandidateLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FaArrowLeft,
  FaBuilding,
  FaCalendarAlt,
  FaFilePdf,
  FaCheckCircle,
  FaClock,
  FaVideo,
  FaShieldAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const STAGES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
];

const CandidateApplicationDetail = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (applicationId) {
        setLoading(true);
        const data = await getApplicationById(applicationId);
        if (!data) {
          setError('Application not found.');
        } else {
          // Strict privacy check: ensure candidate owns this application
          const isOwner =
            (data.userId && data.userId === user?.uid) ||
            (data.applicantEmail && data.applicantEmail.toLowerCase() === user?.email?.toLowerCase());

          if (!isOwner) {
            setError('Unauthorized: You do not have permission to view this application.');
          } else {
            setApplication(data);
          }
        }
        setLoading(false);
      }
    };

    if (user) {
      fetchApp();
    }
  }, [applicationId, user]);

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;
    setWithdrawing(true);
    const result = await withdrawApplication(applicationId, user.uid);
    if (result.success) {
      setApplication((prev) => ({
        ...prev,
        status: 'Withdrawn',
      }));
    } else {
      alert(result.error || 'Failed to withdraw application.');
    }
    setWithdrawing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="purple">Interview Scheduled</Badge>;
      case 'Selected':
        return <Badge variant="verified">Selected / Hired</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Not Selected</Badge>;
      case 'Withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge variant="primary">Applied</Badge>;
    }
  };

  if (loading) {
    return (
      <CandidateLayout title="Application Details">
        <div className="py-20 text-center text-slate-500 text-xs">Loading application timeline...</div>
      </CandidateLayout>
    );
  }

  if (error || !application) {
    return (
      <CandidateLayout title="Application Error">
        <div className="p-8 text-center glass-surface-2 rounded-3xl border border-rose-200 bg-rose-50/50 max-w-md mx-auto space-y-3">
          <FaExclamationTriangle className="text-3xl text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">{error || 'Record Not Found'}</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/candidate/applications')}>
            Return to Applications
          </Button>
        </div>
      </CandidateLayout>
    );
  }

  const currentStatusIndex = STAGES.indexOf(application.status);
  const isRejected = application.status === 'Rejected';
  const isWithdrawn = application.status === 'Withdrawn';
  const canWithdraw = application.status === 'Applied' || application.status === 'Under Review';

  return (
    <CandidateLayout
      title={application.jobPosition || 'Job Application'}
      subtitle={`Application Reference #${applicationId.slice(0, 8).toUpperCase()}`}
    >
      <div className="max-w-4xl space-y-8">
        
        {/* Back Link */}
        <Link
          to="/candidate/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Back to Applications</span>
        </Link>

        {/* Header Summary Card */}
        <div className="glass-surface-3 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                {application.jobPosition}
              </h2>
              {getStatusBadge(application.status)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
                <FaBuilding />
                <span>{application.companyName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-slate-400" />
                <span>{application.location || 'India'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-slate-400" />
                <span>
                  Applied on{' '}
                  {application.appliedAt?.toDate
                    ? application.appliedAt.toDate().toLocaleDateString('en-IN')
                    : 'Recent'}
                </span>
              </span>
            </div>
          </div>

          {canWithdraw && (
            <Button
              variant="outline"
              size="sm"
              loading={withdrawing}
              onClick={handleWithdraw}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Withdraw Application
            </Button>
          )}
        </div>

        {/* Visual Application Timeline Tracker */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-6">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <FaClock className="text-indigo-600 text-xs" />
            <span>Application Status Tracker</span>
          </h3>

          {!isRejected && !isWithdrawn ? (
            <div className="relative">
              {/* Stepper Progress */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {STAGES.map((stage, idx) => {
                  const isCompleted = currentStatusIndex >= idx;
                  const isCurrent = currentStatusIndex === idx;

                  return (
                    <div key={stage} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                          isCompleted
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isCompleted ? <FaCheckCircle size={14} /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-indigo-600 font-bold' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold block">Status Update:</span>
              <span>
                {isWithdrawn
                  ? 'You have withdrawn this application. The hiring team has been notified.'
                  : 'The employer has concluded review for this candidate application.'}
              </span>
            </div>
          )}
        </div>

        {/* Interview Details Card (If scheduled) */}
        {application.interview && (
          <div className="glass-surface-3 p-6 sm:p-8 rounded-3xl border border-violet-200 bg-violet-50/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-violet-900 font-bold text-base font-display">
              <FaVideo className="text-violet-600" />
              <span>Interview Scheduled by Recruiter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-violet-100">
                <span className="text-slate-500 block mb-0.5">Date</span>
                <span className="font-bold text-slate-900">{application.interview.date}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-violet-100">
                <span className="text-slate-500 block mb-0.5">Time</span>
                <span className="font-bold text-slate-900">{application.interview.time}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-violet-100">
                <span className="text-slate-500 block mb-0.5">Format</span>
                <span className="font-bold text-slate-900">{application.interview.type}</span>
              </div>
            </div>

            {application.interview.meetingLink && (
              <div className="p-3 bg-white rounded-xl border border-violet-100 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Meeting / Joining Link</span>
                  <span className="font-mono text-indigo-600">{application.interview.meetingLink}</span>
                </div>
                <a
                  href={application.interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs"
                >
                  Join Meeting
                </a>
              </div>
            )}
          </div>
        )}

        {/* Application Credentials Summary */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Submitted Application Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Applicant Name</span>
              <span className="font-bold text-slate-900">{application.applicantName}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Contact Email</span>
              <span className="font-bold text-slate-900">{application.applicantEmail}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Contact Phone</span>
              <span className="font-bold text-slate-900">{application.applicantPhone || 'Not provided'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Resume Attachment</span>
              {application.resume ? (
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-indigo-600 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <FaFilePdf className="text-rose-500" />
                  <span>View Submitted Resume</span>
                </a>
              ) : (
                <span className="text-slate-400">Attached on file</span>
              )}
            </div>
          </div>

          {application.notes && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold block mb-1">Candidate Cover Note</span>
              <p className="text-slate-800 leading-relaxed italic">"{application.notes}"</p>
            </div>
          )}
        </div>

      </div>
    </CandidateLayout>
  );
};

export default CandidateApplicationDetail;
