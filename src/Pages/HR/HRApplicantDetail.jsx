import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  saveInternalNotes,
} from '../../services/recruitmentService';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFilePdf,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStickyNote,
  FaHistory,
} from 'react-icons/fa';

const STATUS_OPTIONS = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Rejected',
];

const HRApplicantDetail = () => {
  const { applicationId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Change State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Interview Schedule State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('Virtual Google Meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Internal Notes State
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchApp = async () => {
      if (applicationId) {
        setLoading(true);
        const data = await getApplicationById(applicationId);
        if (!data) {
          setError('Application record not found.');
        } else {
          // Verify company ownership: check companyId or companyName
          const companyName = userData?.companyName || '';
          const isOwner =
            data.companyId === user?.uid ||
            (companyName && data.companyName?.toLowerCase() === companyName.toLowerCase()) ||
            user?.email?.includes('admin'); // Super-admin bypass

          if (!isOwner) {
            setError('Unauthorized: This candidate application belongs to another organization.');
          } else {
            setApplication(data);
            setSelectedStatus(data.status || 'Applied');
            setInternalNotes(data.internalNotes || '');
          }
        }
        setLoading(false);
      }
    };

    if (user) {
      fetchApp();
    }
  }, [applicationId, user, userData]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdatingStatus(true);
    setFeedback(null);
    const result = await updateApplicationStatus(applicationId, selectedStatus, statusNote);
    if (result.success) {
      setFeedback({ type: 'success', text: `Status updated to "${selectedStatus}".` });
      setApplication((prev) => ({
        ...prev,
        status: selectedStatus,
        statusTimeline: [
          ...(prev.statusTimeline || []),
          {
            status: selectedStatus,
            timestamp: new Date().toISOString(),
            note: statusNote || `Updated by ${userData?.hrName || 'HR Team'}`,
          },
        ],
      }));
      setStatusNote('');
    } else {
      setFeedback({ type: 'error', text: result.error || 'Failed to update status.' });
    }
    setUpdatingStatus(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      alert('Please specify both interview date and time.');
      return;
    }

    setScheduling(true);
    const details = {
      date: interviewDate,
      time: interviewTime,
      type: interviewType,
      meetingLink,
    };

    const result = await scheduleInterview(applicationId, details);
    if (result.success) {
      setFeedback({ type: 'success', text: 'Interview scheduled and candidate notified!' });
      setApplication((prev) => ({
        ...prev,
        status: 'Interview Scheduled',
        interview: details,
      }));
      setSelectedStatus('Interview Scheduled');
      setShowInterviewModal(false);
    } else {
      setFeedback({ type: 'error', text: result.error || 'Failed to schedule interview.' });
    }
    setScheduling(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setSavingNotes(true);
    const result = await saveInternalNotes(applicationId, internalNotes);
    if (result.success) {
      setFeedback({ type: 'success', text: 'Internal HR notes saved securely.' });
    } else {
      setFeedback({ type: 'error', text: result.error || 'Failed to save notes.' });
    }
    setSavingNotes(false);
    setTimeout(() => setFeedback(null), 4000);
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
      <DashboardLayout title="Applicant Detail">
        <div className="py-20 text-center text-slate-500 text-xs">Loading applicant profile...</div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout title="Applicant Error">
        <div className="p-8 text-center glass-surface-2 rounded-3xl border border-rose-200 bg-rose-50/50 max-w-md mx-auto space-y-3">
          <FaExclamationTriangle className="text-3xl text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">{error || 'Record Not Found'}</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/hr/applicants')}>
            Return to Candidate Pipeline
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={application.applicantName || 'Candidate Profile'}
      subtitle={`Applied for ${application.jobPosition} • Reference #${applicationId.slice(0, 8).toUpperCase()}`}
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={<FaArrowLeft className="text-[10px]" />}
          onClick={() => navigate('/hr/applicants')}
        >
          Pipeline
        </Button>
      }
    >
      <div className="max-w-5xl space-y-8">
        
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 2-Column Split: Candidate Info vs Recruiter Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Candidate Dossier (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Profile Box */}
            <div className="glass-surface-3 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xl shadow-xs">
                    {application.applicantName?.charAt(0) || <FaUser />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      {application.applicantName}
                    </h2>
                    <span className="text-xs text-indigo-600 font-medium block">
                      Target Role: {application.jobPosition}
                    </span>
                  </div>
                </div>

                {getStatusBadge(application.status)}
              </div>

              {/* Contact Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <FaEnvelope className="text-slate-400" />
                  <a href={`mailto:${application.applicantEmail}`} className="text-indigo-600 hover:underline truncate">
                    {application.applicantEmail}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <FaPhone className="text-slate-400" />
                  <a href={`tel:${application.applicantPhone}`} className="text-slate-800 hover:text-indigo-600">
                    {application.applicantPhone || 'Not provided'}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Total Experience</span>
                  <span className="font-bold text-slate-900">{application.experienceYears || 'Not specified'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Notice Period</span>
                  <span className="font-bold text-slate-900">{application.noticePeriod || 'Standard'}</span>
                </div>
              </div>

              {/* Secure Resume Download Button */}
              <div className="pt-2">
                {application.resume ? (
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition"
                  >
                    <FaFilePdf className="text-rose-500 text-base" />
                    <span>Download Candidate Resume / CV Document</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic block">No resume attachment provided.</span>
                )}
              </div>
            </div>

            {/* Candidate Cover Pitch */}
            {application.notes && (
              <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 font-display">Candidate Cover Pitch</h3>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  "{application.notes}"
                </p>
              </div>
            )}

            {/* Status Timeline History */}
            <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <FaHistory className="text-indigo-600 text-xs" />
                <span>Application Audit Timeline</span>
              </h3>

              <div className="space-y-3">
                {application.statusTimeline?.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-indigo-200 pl-3 py-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(t.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {t.note && <p className="text-slate-600 mt-0.5">{t.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Recruiter Controls (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Action 1: Change Status */}
            <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Update Pipeline Status
              </h3>

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">New Stage</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status Audit Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared technical round 1"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={updatingStatus}
                  className="w-full"
                >
                  Commit Status Change
                </Button>
              </form>
            </div>

            {/* Action 2: Schedule Interview */}
            <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaVideo className="text-violet-600 text-xs" />
                  <span>Interview Scheduling</span>
                </h3>
              </div>

              {application.interview ? (
                <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs space-y-1">
                  <span className="font-bold text-violet-900 block">Confirmed Interview Round</span>
                  <div className="text-slate-700">
                    {application.interview.date} at {application.interview.time} ({application.interview.type})
                  </div>
                  {application.interview.meetingLink && (
                    <a
                      href={application.interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline block pt-1 font-mono truncate"
                    >
                      {application.interview.meetingLink}
                    </a>
                  )}
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="text-[11px] text-violet-700 font-bold underline block pt-2"
                  >
                    Reschedule Interview
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowInterviewModal(true)}
                  className="w-full"
                >
                  Schedule Interview Round
                </Button>
              )}

              {/* Schedule Form Modal/Inline */}
              {showInterviewModal && (
                <form onSubmit={handleScheduleInterview} className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Date</label>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Time</label>
                      <input
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Interview Format</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                    >
                      <option value="Virtual Google Meet">Virtual Google Meet</option>
                      <option value="Technical Screening Round">Technical Screening Round</option>
                      <option value="Managerial Discussion">Managerial Discussion</option>
                      <option value="HR / Culture Fit Round">HR / Culture Fit Round</option>
                      <option value="In-Person Office Interview">In-Person Office Interview</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Meeting Link or Location</label>
                    <input
                      type="text"
                      placeholder="https://meet.google.com/xyz or Office Address"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" loading={scheduling} className="flex-1">
                      Save & Notify Candidate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInterviewModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Action 3: Private Internal Recruiter Notes */}
            <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <FaStickyNote className="text-indigo-600 text-xs" />
                <span>Private Recruiter Notes</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                These notes are confidential to your company HR team and are never visible to the candidate.
              </p>

              <form onSubmit={handleSaveNotes} className="space-y-3">
                <textarea
                  rows="4"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record assessment scores, salary expectations, tech evaluations..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  loading={savingNotes}
                  className="w-full"
                >
                  Save Internal Notes
                </Button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default HRApplicantDetail;
