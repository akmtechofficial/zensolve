import React, { useEffect, useState } from 'react';
import JobCard from './components/JobCard';
import { getJobs } from './services/recruitmentService';
import { FaSearch } from 'react-icons/fa';

const JobList = ({ maxJobs, filterCategory, initialSearch = '', showSearch = false, onQuickApply }) => {
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
        <div className="relative mb-5 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Filter roles or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 text-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].slice(0, maxJobs || 6).map((n) => (
            <div
              key={n}
              className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 bg-slate-200 rounded w-20" />
                <div className="h-5 bg-slate-200 rounded w-24" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-7 bg-slate-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onQuickApply={onQuickApply} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No jobs found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category.</p>
        </div>
      )}
    </div>
  );
};

export default JobList;
