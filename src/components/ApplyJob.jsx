import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
} from 'react-icons/fa';
import { Button } from './ui/Button';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE_MB = 10;

const ApplyJob = ({ job: propJob, onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = propJob || location.state?.job;

  const [applicantName, setApplicantName] = useState(auth.currentUser?.displayName || '');
  const [applicantEmail, setApplicantEmail] = useState(auth.currentUser?.email || '');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [resume, setResume] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
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
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);
    setProgress(20);
    setError(null);

    try {
      let resumeURL = '';
      if (resume) {
        try {
          const timestamp = Date.now();
          const cleanName = resume.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storageRef = ref(storage, `resumes/${timestamp}_${cleanName}`);
          await uploadBytes(storageRef, resume);
          setProgress(60);
          resumeURL = await getDownloadURL(storageRef);
        } catch (storageErr) {
          console.warn('Storage upload note:', storageErr);
          // If storage bucket is not configured, record filename for continuity
          resumeURL = `Uploaded: ${resume.name}`;
        }
      }

      setProgress(80);
      const applicationsRef = collection(db, 'jobApplications');
      await addDoc(applicationsRef, {
        jobId: job.id,
        applicantName,
        applicantEmail,
        applicantPhone,
        resume: resumeURL,
        notes,
        jobPosition: job.position,
        companyName: job.companyName,
        appliedAt: serverTimestamp(),
        userId: auth.currentUser?.uid || 'guest',
        status: 'Pending',
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
