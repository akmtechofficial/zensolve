import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getUserSavedJobs } from '../services/recruitmentService';
import JobCard from './JobCard';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import ApplyJob from './ApplyJob';
import { FaBookmark, FaBriefcase, FaArrowRight, FaSpinner } from 'react-icons/fa';

const SaveJob = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickApplyJob, setQuickApplyJob] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSaved = async () => {
      if (user?.uid) {
        setLoading(true);
        const jobs = await getUserSavedJobs(user.uid);
        if (isMounted) {
          setSavedJobs(jobs);
          setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSaved();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.uid, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-20 px-4">
        <div className="max-w-md mx-auto text-center glass-panel bg-white/95 p-8 rounded-3xl border border-slate-200/90 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <FaBookmark size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Saved Jobs</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Please log in to your candidate account to view and manage your bookmarked job openings.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" size="md" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/register')}>
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Candidate Bookmarks
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Saved Jobs ({savedJobs.length})
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Roles you have saved for later review or application.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={<FaBriefcase className="text-xs" />}
            onClick={() => navigate('/jobs')}
          >
            Browse More Jobs
          </Button>
        </div>

        {/* Saved Jobs Grid */}
        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onQuickApply={(j) => setQuickApplyJob(j)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 glass-panel bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <FaBookmark size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Saved Jobs Yet</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              When browsing through job listings, click the bookmark icon to save opportunities here.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/jobs')}
            >
              Explore Openings
            </Button>
          </div>
        )}

      </div>

      {/* Quick Apply Modal */}
      {quickApplyJob && (
        <Modal
          isOpen={Boolean(quickApplyJob)}
          onClose={() => setQuickApplyJob(null)}
          title={`Apply for ${quickApplyJob.position}`}
          subtitle={`At ${quickApplyJob.companyName}`}
          maxWidth="max-w-2xl"
        >
          <ApplyJob
            job={quickApplyJob}
            onSuccess={() => {
              setQuickApplyJob(null);
              navigate('/thank-you', {
                state: {
                  jobPosition: quickApplyJob.position,
                  companyName: quickApplyJob.companyName,
                },
              });
            }}
          />
        </Modal>
      )}

    </div>
  );
};

export default SaveJob;
