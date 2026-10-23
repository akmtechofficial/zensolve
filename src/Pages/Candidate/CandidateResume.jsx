import React, { useState } from 'react';
import { useAuth } from '../../components/useAuth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import CandidateLayout from './CandidateLayout';
import { Button } from '../../components/ui/Button';
import {
  FaFileUpload,
  FaFilePdf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaExternalLinkAlt,
  FaTrash,
  FaShieldAlt,
} from 'react-icons/fa';

const MAX_FILE_SIZE_MB = 10;

const CandidateResume = () => {
  const { user, userData, refreshUser } = useAuth();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentResumeUrl = userData?.resumeURL || userData?.resume;
  const currentResumeName = userData?.resumeName || 'Default_Resume.pdf';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        setFeedback({ type: 'error', text: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.` });
        return;
      }
      setFile(selected);
      setFeedback(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user?.uid) return;

    setUploading(true);
    setProgress(20);
    setFeedback(null);

    try {
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `resumes/${user.uid}/${timestamp}_${cleanName}`);
      
      setProgress(40);
      await uploadBytes(storageRef, file);
      
      setProgress(75);
      const downloadURL = await getDownloadURL(storageRef);

      setProgress(90);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeURL: downloadURL,
        resumeName: file.name,
        resumeStoragePath: storageRef.fullPath,
        resumeUploadedAt: serverTimestamp(),
      });

      setProgress(100);
      setFeedback({ type: 'success', text: 'Resume uploaded and linked to your candidate profile!' });
      setFile(null);
      await refreshUser();
    } catch (err) {
      console.error('Resume upload error:', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to upload resume. Please check your connection and try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!user?.uid || !currentResumeUrl) return;
    if (!window.confirm('Are you sure you want to remove your resume? Employers will not be able to review it until you upload a replacement.')) return;

    try {
      setUploading(true);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeURL: null,
        resume: null,
        resumeName: null,
        resumeStoragePath: null,
        resumeUploadedAt: null,
      });

      setFeedback({ type: 'success', text: 'Resume removed from your profile.' });
      await refreshUser();
    } catch (err) {
      console.error('Error removing resume:', err);
      setFeedback({ type: 'error', text: 'Failed to remove resume: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <CandidateLayout
      title="Resume / CV Management"
      subtitle="Upload and maintain your primary resume used for 1-click job applications."
    >
      <div className="max-w-3xl space-y-8">
        
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

        {/* Current Active Resume Card */}
        {currentResumeUrl ? (
          <div className="glass-surface-3 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0">
                  <FaFilePdf />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 font-display">
                      {currentResumeName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Active CV
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Recruiters receive this verified document when you click Apply Now.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentResumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition border border-indigo-200"
                >
                  <FaExternalLinkAlt size={11} />
                  <span>View / Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleDeleteResume}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition border border-rose-200"
                >
                  <FaTrash size={11} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <FaExclamationTriangle className="text-amber-600 text-lg flex-shrink-0" />
            <div>
              <span className="font-bold block">No Resume on File</span>
              <span>Upload your PDF or Word document below to enable 1-click applications across ZenSolve.</span>
            </div>
          </div>
        )}

        {/* Upload / Replace Dropzone */}
        <div className="glass-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {currentResumeUrl ? 'Replace Current Resume' : 'Upload Primary Resume'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Accepted formats: PDF, DOC, DOCX. Maximum file size: 10MB.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl p-8 text-center bg-slate-50/70 hover:bg-indigo-50/20 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <FaFilePdf className="text-rose-500 text-3xl" />
                  <span className="text-sm font-bold text-slate-900">{file.name}</span>
                  <span className="text-xs text-slate-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <FaFileUpload className="mx-auto text-indigo-500 text-3xl mb-1" />
                  <p className="text-sm font-bold text-slate-800">
                    Drag and drop your updated resume file here, or{' '}
                    <span className="text-indigo-600 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500">PDF format recommended for highest recruiter compatibility</p>
                </div>
              )}
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-right text-[11px] text-slate-500">Saving resume credentials... {progress}%</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={uploading}
              disabled={!file}
              className="w-full sm:w-auto font-bold shadow-md shadow-indigo-500/10"
            >
              Upload & Save to Profile
            </Button>
          </form>
        </div>

        {/* Security & Privacy Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
          <FaShieldAlt className="text-indigo-600 text-lg flex-shrink-0" />
          <span>
            Candidate Resume Privacy: Your resume document is never shared publicly. Only verified HR recruiters of jobs you explicitly apply for are granted access to download and review your CV.
          </span>
        </div>

      </div>
    </CandidateLayout>
  );
};

export default CandidateResume;
