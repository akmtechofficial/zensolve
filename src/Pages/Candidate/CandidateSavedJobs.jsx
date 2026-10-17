import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import { getUserSavedJobs, toggleSaveJob } from '../../services/recruitmentService';
import CandidateLayout from './CandidateLayout';
import JobCard from '../../components/JobCard';
import { Button } from '../../components/ui/Button';
import { FaBookmark, FaArrowRight, FaBriefcase } from 'react-icons/fa';

const CandidateSavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (user?.uid) {
      setLoading(true);
      const jobs = await getUserSavedJobs(user.uid);
      setSavedJobs(jobs);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [user]);

  const handleRemove = async (jobId) => {
    await toggleSaveJob(user.uid, jobId);
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  return (
    <CandidateLayout
      title="Saved Bookmarks"
      subtitle="Job openings you have bookmarked for future review and application."
    >
      <div className="space-y-6">
        
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            Loading bookmarked positions...
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onQuickApply={() => navigate(`/jobs/${job.id}/apply`)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-surface-2 p-12 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-xs">
              <FaBookmark />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">No Saved Jobs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When browsing through job listings, click the bookmark icon on any card to save it here for fast application.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/jobs')}
              className="mt-2"
            >
              Explore Job Openings
            </Button>
          </div>
        )}

      </div>
    </CandidateLayout>
  );
};

export default CandidateSavedJobs;
