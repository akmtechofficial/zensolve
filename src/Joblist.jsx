import React, { useEffect, useState } from 'react';
import JobCard from './components/JobCard';
import { getJobs } from './services/recruitmentService';
import { FaSearch, FaBriefcase, FaSpinner } from 'react-icons/fa';
import { Button } from './components/ui/Button';

const JobList = ({ maxJobs, filterCategory, initialSearch = '', showSearch = true, onQuickApply }) => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      setLoading(true);
      const data = await getJobs({
        category: filterCategory,
      });
      if (isMounted) {
        setJobs(data);
        setLoading(false);
      }
    };
    fetch();
    return () => {
      isMounted = false;
    };
  }, [filterCategory]);

  const filteredJobs = jobs
    .filter((job) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (job.position && job.position.toLowerCase().includes(term)) ||
        (job.companyName && job.companyName.toLowerCase().includes(term)) ||
        (job.location && job.location.toLowerCase().includes(term)) ||
        (job.category && job.category.toLowerCase().includes(term))
      );
    })
    .slice(0, maxJobs || jobs.length);

  return (
    <div className="w-full">
      {/* Search Input if enabled */}
      {showSearch && (
        <div className="relative mb-6 max-w-xl mx-auto">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search roles, skills, or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition text-sm shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].slice(0, maxJobs || 6).map((n) => (
            <div
              key={n}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-800 rounded w-2/3" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-slate-800 rounded-full w-20" />
                <div className="h-6 bg-slate-800 rounded-full w-24" />
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="h-5 bg-slate-800 rounded w-28" />
                <div className="h-8 bg-slate-800 rounded-xl w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onQuickApply={onQuickApply} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-slate-800 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FaBriefcase size={22} />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">No Openings Found</h4>
          <p className="text-sm text-slate-400 mb-5">
            {searchTerm
              ? `No jobs match your search for "${searchTerm}". Try resetting your filters.`
              : 'There are currently no published positions matching this criteria.'}
          </p>
          {searchTerm && (
            <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
              Reset Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobList;
