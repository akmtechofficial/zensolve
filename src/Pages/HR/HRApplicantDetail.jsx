import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  saveInternalNotes,
  getInternalNotes,
} from '../../services/recruitmentService';
import { getSecureResumeUrl } from '../../services/storageService';
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
  FaGraduationCap,
  FaBriefcase,
  FaMapMarkerAlt,
  FaTags,
  FaLanguage,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaMoneyBillWave,
  FaIdCard,
  FaPrint,
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
  const { user, userData, isAdmin } = useAuth();
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

  // Resume Retrieval State
  const [downloadingResume, setDownloadingResume] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (applicationId) {
        setLoading(true);
        const data = await getApplicationById(applicationId);
        if (!data) {
          setError('Application record not found.');
        } else {
          // S20: Strict tenant ownership by immutable UID only; no companyName fallback
          const isOwner = data.companyId === user?.uid || isAdmin;

          if (!isOwner) {
            setError('Unauthorized: This candidate application belongs to another organization.');
          } else {
            setApplication(data);
            setSelectedStatus(data.status || 'Applied');

            // S06: Load confidential HR notes from protected subcollection
            try {
              const notes = await getInternalNotes(applicationId);
              setInternalNotes(notes || data.internalNotes || '');
            } catch (notesErr) {
              console.warn('Failed loading HR notes:', notesErr);
            }
          }
        }
        setLoading(false);
      }
    };

    if (user) {
      fetchApp();
    }
  }, [applicationId, user, userData, isAdmin]);

  const handleDownloadResume = async () => {
    if (!application?.resume) return;
    setDownloadingResume(true);
    try {
      const url = await getSecureResumeUrl({
        resumePath: application.resumeStoragePath || application.resume,
        applicationId,
      });
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Invalid or missing resume download path.');
      }
    } catch (err) {
      console.error('Error fetching resume URL:', err);
      alert('Unable to load candidate resume: ' + err.message);
    } finally {
      setDownloadingResume(false);
    }
  };

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
            <div className="glass-surface-3 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {application.applicantPhoto || application.profileSnapshot?.photoURL ? (
                    <img
                      src={application.applicantPhoto || application.profileSnapshot?.photoURL}
                      alt={application.applicantName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                      {application.applicantName?.charAt(0) || <FaUser />}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                      {application.applicantName}
                    </h2>
                    {(application.applicantHeadline || application.profileSnapshot?.headline) && (
                      <p className="text-xs font-semibold text-slate-700">
                        {application.applicantHeadline || application.profileSnapshot?.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        Target: {application.jobPosition}
                      </span>
                      {(application.applicantLocation || application.profileSnapshot?.location || application.location) && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                          <FaMapMarkerAlt className="text-rose-500 text-[10px]" />
                          <span>{application.applicantLocation || application.profileSnapshot?.location || application.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              {/* Contact & Professional Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <FaEnvelope size={11} />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-medium">Email Address</span>
                    <a href={`mailto:${application.applicantEmail}`} className="text-indigo-600 font-semibold hover:underline truncate block">
                      {application.applicantEmail}
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <FaPhone size={11} />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-medium">Phone / WhatsApp</span>
                    <a href={`tel:${application.applicantPhone}`} className="text-slate-800 font-semibold hover:text-indigo-600 truncate block">
                      {application.applicantPhone || 'Not provided'}
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <FaBriefcase size={11} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total Experience</span>
                    <span className="font-bold text-slate-900">
                      {application.experienceYears || application.profileSnapshot?.experienceYears || 'Fresher / Not specified'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <FaClock size={11} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Notice Period</span>
                    <span className="font-bold text-slate-900">
                      {application.noticePeriod || application.profileSnapshot?.noticePeriod || 'Standard'}
                    </span>
                  </div>
                </div>

                {(application.expectedSalary || application.profileSnapshot?.expectedSalary || application.currentSalary || application.profileSnapshot?.currentSalary) && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Current CTC</span>
                      <span className="font-bold text-slate-900">
                        {application.currentSalary || application.profileSnapshot?.currentSalary ? `₹${application.currentSalary || application.profileSnapshot?.currentSalary}` : 'Not disclosed'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Expected CTC</span>
                      <span className="font-bold text-emerald-700">
                        {application.expectedSalary || application.profileSnapshot?.expectedSalary ? `₹${application.expectedSalary || application.profileSnapshot?.expectedSalary}` : 'Negotiable'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social / Portfolio Links */}
              {(application.portfolioURL || application.profileSnapshot?.portfolioURL || application.linkedinURL || application.profileSnapshot?.linkedinURL || application.githubURL || application.profileSnapshot?.githubURL) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(application.portfolioURL || application.profileSnapshot?.portfolioURL) && (
                    <a
                      href={application.portfolioURL || application.profileSnapshot?.portfolioURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                    >
                      <FaGlobe className="text-indigo-600" />
                      <span>Portfolio / Website</span>
                    </a>
                  )}
                  {(application.linkedinURL || application.profileSnapshot?.linkedinURL) && (
                    <a
                      href={application.linkedinURL || application.profileSnapshot?.linkedinURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 transition"
                    >
                      <FaLinkedin className="text-blue-600" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {(application.githubURL || application.profileSnapshot?.githubURL) && (
                    <a
                      href={application.githubURL || application.profileSnapshot?.githubURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 transition"
                    >
                      <FaGithub />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}

              {/* Resume / CV Action Button */}
              <div className="pt-2">
                {application.resume && application.resume !== 'DIGITAL_PROFILE_CV' && !application.resume.startsWith('profile://') ? (
                  <button
                    type="button"
                    disabled={downloadingResume}
                    onClick={handleDownloadResume}
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <FaFilePdf className="text-rose-300 text-base" />
                    <span>
                      {downloadingResume ? 'Authorizing & Loading CV…' : 'Securely Open Candidate Resume / CV'}
                    </span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <FaIdCard className="text-emerald-600 text-base" />
                      <span>Applied with Verified Digital Profile Resume</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition"
                    >
                      <FaPrint size={10} />
                      <span>Print Dossier</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Bio / Professional Summary */}
            {(application.applicantBio || application.profileSnapshot?.bio || application.bio) && (
              <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaUser className="text-indigo-600 text-xs" />
                  <span>About Candidate / Professional Summary</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line font-medium">
                  {application.applicantBio || application.profileSnapshot?.bio || application.bio}
                </p>
              </div>
            )}

            {/* Skills & Core Competencies */}
            {((Array.isArray(application.skills) && application.skills.length > 0) ||
              (Array.isArray(application.applicantSkills) && application.applicantSkills.length > 0) ||
              (Array.isArray(application.profileSnapshot?.skills) && application.profileSnapshot.skills.length > 0)) && (
              <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaTags className="text-indigo-600 text-xs" />
                  <span>Candidate Skills & Competencies</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(application.skills || application.applicantSkills || application.profileSnapshot?.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience & Employment History */}
            {((Array.isArray(application.experience) && application.experience.length > 0) ||
              (Array.isArray(application.profileSnapshot?.experience) && application.profileSnapshot.experience.length > 0)) && (
              <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaBriefcase className="text-indigo-600 text-xs" />
                  <span>Work Experience & Employment History</span>
                </h3>
                <div className="space-y-3">
                  {(application.experience || application.profileSnapshot?.experience || []).map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {exp.role || exp.title || 'Job Role'}
                        </h4>
                        {(exp.duration || exp.years) && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {exp.duration || exp.years}
                          </span>
                        )}
                      </div>
                      {(exp.company || exp.companyName) && (
                        <p className="text-xs font-semibold text-slate-600">
                          {exp.company || exp.companyName}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Academic Credentials */}
            {((Array.isArray(application.education) && application.education.length > 0) ||
              (Array.isArray(application.profileSnapshot?.education) && application.profileSnapshot.education.length > 0)) && (
              <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaGraduationCap className="text-indigo-600 text-xs" />
                  <span>Education & Academic Credentials</span>
                </h3>
                <div className="space-y-3">
                  {(application.education || application.profileSnapshot?.education || []).map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {edu.degree || edu.qualification || 'Degree / Course'}
                        </h4>
                        {edu.year && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {edu.year}
                          </span>
                        )}
                      </div>
                      {(edu.school || edu.college || edu.institution) && (
                        <p className="text-xs font-medium text-slate-600">
                          {edu.school || edu.college || edu.institution}
                        </p>
                      )}
                      {(edu.grade || edu.percentage) && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mt-0.5">
                          Score: {edu.grade || edu.percentage}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Known */}
            {((Array.isArray(application.languages) && application.languages.length > 0) ||
              (Array.isArray(application.profileSnapshot?.languages) && application.profileSnapshot.languages.length > 0)) && (
              <div className="glass-surface-2 p-6 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <FaLanguage className="text-indigo-600 text-xs" />
                  <span>Languages Known (भाषायें)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(application.languages || application.profileSnapshot?.languages || []).map((l, idx) => {
                    const name = typeof l === 'string' ? l : l.name;
                    const prof = typeof l === 'string' ? '' : l.proficiency;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold"
                      >
                        <span>{name}</span>
                        {prof && (
                          <span className="text-[10px] text-indigo-600 font-normal">({prof})</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

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
