import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getJobs } from '../services/recruitmentService';
import JobCard from '../components/JobCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import ApplyJob from '../components/ApplyJob';
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaBriefcase,
  FaMapMarkerAlt,
  FaClock,
  FaLaptopHouse,
  FaSortAmountDown,
  FaBuilding,
} from 'react-icons/fa';

const categories = [
  'All',
  'IT & Software',
  'Finance',
  'Healthcare',
  'Business',
  'Education',
  'Construction',
  'Logistics',
  'Teaching',
];

const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

const experienceLevels = ['All', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];

const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params from URL
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  const initialSearch = queryParams.get('search') || '';
  const initialLocation = queryParams.get('location') || 'All';

  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [quickApplyJob, setQuickApplyJob] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      setLoading(true);
      const data = await getJobs();
      if (isMounted) {
        setAllJobs(data);
        setLoading(false);
      }
    };
    fetch();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync category if URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) setSelectedCategory(cat);
    const s = params.get('search');
    if (s) setSearch(s);
  }, [location.search]);

  // Filtering Logic
  const filteredJobs = allJobs
    .filter((job) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesPosition = job.position && job.position.toLowerCase().includes(s);
        const matchesCompany = job.companyName && job.companyName.toLowerCase().includes(s);
        const matchesLocation = job.location && job.location.toLowerCase().includes(s);
        const matchesCat = job.category && job.category.toLowerCase().includes(s);
        if (!matchesPosition && !matchesCompany && !matchesLocation && !matchesCat) return false;
      }

      if (selectedCategory !== 'All') {
        if (!job.category || job.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      if (selectedJobType !== 'All') {
        if (!job.jobType || job.jobType.toLowerCase() !== selectedJobType.toLowerCase()) {
          return false;
        }
      }

      if (selectedLocation !== 'All') {
        if (!job.location || !job.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      if (selectedExp !== 'All') {
        if (job.experience && !job.experience.toLowerCase().includes(selectedExp.toLowerCase())) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'salaryHigh') {
        return (Number(b.salaryTo) || 0) - (Number(a.salaryTo) || 0);
      }
      if (sortBy === 'salaryLow') {
        return (Number(a.salaryFrom) || 0) - (Number(b.salaryFrom) || 0);
      }
      // default: newest
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

  const activeFiltersCount =
    (search ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedJobType !== 'All' ? 1 : 0) +
    (selectedExp !== 'All' ? 1 : 0) +
    (selectedLocation !== 'All' ? 1 : 0);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedJobType('All');
    setSelectedExp('All');
    setSelectedLocation('All');
    navigate('/jobs');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Career Discovery Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Explore Open Positions
          </h1>
          <p className="text-slate-400 text-base mt-2 max-w-2xl">
            Find vetted opportunities with transparent compensation, verified company credentials, and direct application routes.
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 mb-8 space-y-4">
          
          {/* Main Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title, skill keywords, or company..."
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-750 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-750 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-750 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="All">All Job Types</option>
                {jobTypes.filter((t) => t !== 'All').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Filters Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
                Filter by:
              </span>

              {/* Experience dropdown */}
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">Any Experience</option>
                {experienceLevels.filter((e) => e !== 'All').map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>

              {/* Location quick filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Locations</option>
                <option value="Remote">Remote Only</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Patna">Patna</option>
              </select>
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FaSortAmountDown />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-200 border-none focus:outline-none cursor-pointer font-medium"
                >
                  <option value="newest" className="bg-slate-900">Newest First</option>
                  <option value="salaryHigh" className="bg-slate-900">Salary: High to Low</option>
                  <option value="salaryLow" className="bg-slate-900">Salary: Low to High</option>
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 transition"
                >
                  <FaTimes size={10} />
                  <span>Reset All ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Results Counter & Active Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm text-slate-400">
            Showing <span className="font-bold text-white">{filteredJobs.length}</span> verified career opening{filteredJobs.length === 1 ? '' : 's'}
          </p>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Search: "{search}"
                  <button onClick={() => setSearch('')}><FaTimes size={9} /></button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}><FaTimes size={9} /></button>
                </span>
              )}
              {selectedJobType !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Type: {selectedJobType}
                  <button onClick={() => setSelectedJobType('All')}><FaTimes size={9} /></button>
                </span>
              )}
              {selectedLocation !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Location: {selectedLocation}
                  <button onClick={() => setSelectedLocation('All')}><FaTimes size={9} /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="glass-panel p-6 rounded-2xl border border-slate-800 animate-pulse space-y-4"
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
              <JobCard
                key={job.id}
                job={job}
                onQuickApply={(j) => setQuickApplyJob(j)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 glass-panel rounded-3xl border border-slate-800 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <FaBriefcase size={26} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Matching Jobs Found</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We couldn't find any positions matching your active filters. Try broadening your keywords or resetting filters.
            </p>
            <Button variant="primary" size="md" onClick={resetFilters}>
              Reset All Filters
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
          subtitle={`At ${quickApplyJob.companyName} • ${quickApplyJob.location || 'India'}`}
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

export default Jobs;
