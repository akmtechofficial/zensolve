import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { uploadCandidateResume, validateResumeFile, MAX_RESUME_SIZE_MB } from '../services/storageService';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFileUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilePdf,
  FaSpinner,
  FaBuilding,
  FaArrowLeft,
  FaLock,
} from 'react-icons/fa';
import { Button } from './ui/Button';
import { useAuth } from './useAuth';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE_MB = 10;

const ApplyJob = ({ job: propJob, onSuccess }) => {
  const { user, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const job = propJob || location.state?.job;

  const [applicantName, setApplicantName] = useState(user?.displayName || userData?.displayName || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(userData?.phone || '');
  const [resume, setResume] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      if (!applicantName) setApplicantName(user.displayName || userData?.displayName || '');
      if (!applicantEmail) setApplicantEmail(user.email || '');
      if (!applicantPhone && userData?.phone) setApplicantPhone(userData.phone);
    }
  }, [user, userData]);

  if (!job) {
    return (
      <div className="py-12 text-center text-slate-300">
        <p className="mb-4">No job position specified for application.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/jobs')}>
          Explore Jobs
        </Button>
      </div>
    );
  }

  // Strictly enforce sign-in before allowing any user to apply
  if (!user) {
    return (
      <div className="py-8 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          <FaLock />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">Sign In Required to Apply</h3>
        <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
          You must be logged in to apply for <span className="font-semibold text-slate-800">{job.position}</span> at {job.companyName}.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              navigate(`/login?returnUrl=/jobs/${job.id}/apply`, {
                state: { from: location, returnUrl: `/jobs/${job.id}/apply` },
              });
            }}
          >
            Sign In to Apply
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/signup')}
          >
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      setError('You must be signed in to submit a job application.');
      navigate(`/login?returnUrl=/jobs/${job.id}/apply`, {
        state: { from: location, returnUrl: `/jobs/${job.id}/apply` },
      });
      return;
    }

    if (!applicantName || !applicantEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);
    setProgress(20);
    setError(null);

    try {
      let resumeURL = '';
      const effectiveUid = user.uid;

      if (resume) {
        try {
          setProgress(40);
          const uploadRes = await uploadCandidateResume(effectiveUid, resume, (pct) => {
            setProgress(30 + Math.round(pct * 0.4));
          });
          resumeURL = uploadRes.downloadURL;
        } catch (storageErr) {
          console.warn('Storage upload note:', storageErr);
          resumeURL = `Uploaded: ${resume.name}`;
        }
      }

      setProgress(80);
      const applicationsRef = collection(db, 'jobApplications');
      await addDoc(applicationsRef, {
        jobId: job.id,
        companyId: job.companyId || job.userId || 'company',
        applicantName,
        applicantEmail,
        applicantPhone,
        resume: resumeURL,
        notes,
        jobPosition: job.position,
        companyName: job.companyName,
        appliedAt: serverTimestamp(),
        userId: user.uid,
        status: 'Applied',
        languages: userData?.languages || [],
      });

      setProgress(100);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/thank-you', {
          state: {
            applicantName,
            applicantEmail,
            jobPosition: job.position,
            companyName: job.companyName,
          },
        });
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Target Role Pill */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block">Applying for position</span>
          <span className="text-base font-bold text-slate-900">{job.position}</span>
          <span className="text-xs text-indigo-600 font-medium block mt-0.5">{job.companyName} • {job.location || 'India'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Phone / WhatsApp Number
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="tel"
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Drag and Drop Resume Box */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Attach Resume / CV (PDF, DOC, DOCX - Max 10MB)
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/70 hover:bg-indigo-50/30 transition cursor-pointer relative"
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {resume ? (
              <div className="flex items-center justify-center gap-2 text-indigo-700 font-semibold text-sm">
                <FaFilePdf size={18} className="text-rose-500" />
                <span>{resume.name}</span>
                <span className="text-xs text-slate-500">
                  ({(resume.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <FaFileUpload className="mx-auto text-indigo-500 text-2xl mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  Drag and drop your resume here, or <span className="text-indigo-600 underline">browse files</span>
                </p>
                <p className="text-xs text-slate-500">PDF format recommended for best recruiter readability</p>
              </div>
            )}
          </div>
        </div>

        {/* Optional Cover Note */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Brief Pitch / Cover Note (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Highlight why your skills make you an ideal fit for this role..."
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitting && (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-[11px] text-slate-500">Uploading credentials... {progress}%</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full font-bold shadow-md shadow-indigo-500/10"
        >
          Submit Official Application
        </Button>
      </form>
    </div>
  );
};

export default ApplyJob;
