import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getJobs } from '../services/recruitmentService';
import JobCard from '../components/JobCard';
import { Modal } from '../components/ui/Modal';
import ApplyJob from '../components/ApplyJob';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaFilter,
  FaTimes,
  FaSortAmountDown,
  FaSlidersH,
  FaCheck,
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
];

const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

const experienceLevels = ['All', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];

const popularLocations = [
  'All',
  'Remote',
  'Bengaluru',
  'Delhi NCR',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Patna',
  'Ranchi',
];

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const searchParam = searchParams.get('search') || '';
  const locationParam = searchParams.get('location') || 'All';
  const categoryParam = searchParams.get('category') || 'All';
  const jobTypeParam = searchParams.get('jobType') || 'All';
  const expParam = searchParams.get('experience') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';

  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Local filter states
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedLocation, setSelectedLocation] = useState(locationParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedJobType, setSelectedJobType] = useState(jobTypeParam);
  const [selectedExp, setSelectedExp] = useState(expParam);
  const [sortBy, setSortBy] = useState(sortParam);

  // Modal State for Quick Apply
  const [quickApplyJob, setQuickApplyJob] = useState(null);

  // Sync state with URL when search params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedLocation(searchParams.get('location') || 'All');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSelectedJobType(searchParams.get('jobType') || 'All');
    setSelectedExp(searchParams.get('experience') || 'All');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Load jobs from Firestore
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

  // Update URL parameters
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    const cleaned = new URLSearchParams();
    Object.entries(merged).forEach(([key, val]) => {
      if (val && val !== 'All' && val !== '') {
        cleaned.set(key, val);
      }
    });

    setSearchParams(cleaned);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateParams({ search: searchTerm, location: selectedLocation });
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    updateParams({ category: cat });
  };

  const handleJobTypeChange = (jt) => {
    setSelectedJobType(jt);
    updateParams({ jobType: jt });
  };

  const handleExpChange = (exp) => {
    setSelectedExp(exp);
    updateParams({ experience: exp });
  };

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
    updateParams({ location: loc });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateParams({ sort });
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedLocation('All');
    setSelectedCategory('All');
    setSelectedJobType('All');
    setSelectedExp('All');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  // Filter & sort jobs
  const filteredJobs = useMemo(() => {
    return allJobs
      .filter((job) => {
        if (job.status === 'Closed' || job.status === 'Draft') return false;

        // Keyword filter
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const matchesPosition = job.position && job.position.toLowerCase().includes(s);
          const matchesCompany = job.companyName && job.companyName.toLowerCase().includes(s);
          const matchesLocation = job.location && job.location.toLowerCase().includes(s);
          const matchesCat = job.category && job.category.toLowerCase().includes(s);
          const matchesSkills = job.skills && Array.isArray(job.skills) && job.skills.some((sk) => sk.toLowerCase().includes(s));
          if (!matchesPosition && !matchesCompany && !matchesLocation && !matchesCat && !matchesSkills) {
            return false;
          }
        }

        // Location filter
        if (selectedLocation && selectedLocation !== 'All') {
          if (selectedLocation.toLowerCase() === 'remote') {
            const isRemote =
              job.jobType?.toLowerCase().includes('remote') ||
              job.location?.toLowerCase().includes('remote');
            if (!isRemote) return false;
          } else {
            const locQuery = selectedLocation.toLowerCase();
            const jobLoc = (job.location || '').toLowerCase();
            const isMatch =
              jobLoc.includes(locQuery) ||
              (locQuery === 'bengaluru' && jobLoc.includes('bangalore')) ||
              (locQuery === 'bangalore' && jobLoc.includes('bengaluru'));
            if (!isMatch) return false;
          }
        }

        // Category filter
        if (selectedCategory && selectedCategory !== 'All') {
          if (!job.category || job.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Job Type filter
        if (selectedJobType && selectedJobType !== 'All') {
          if (!job.jobType || job.jobType.toLowerCase() !== selectedJobType.toLowerCase()) {
            return false;
          }
        }

        // Experience filter
        if (selectedExp && selectedExp !== 'All') {
          if (job.experience) {
            const expStr = job.experience.toLowerCase();
            const filterKey = selectedExp.split(' ')[0].toLowerCase();
            if (!expStr.includes(filterKey)) {
              // loose match
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
        if (sortBy === 'title') {
          return (a.position || '').localeCompare(b.position || '');
        }
        if (sortBy === 'company') {
          return (a.companyName || '').localeCompare(b.companyName || '');
        }
        return 0;
      });
  }, [allJobs, searchTerm, selectedLocation, selectedCategory, selectedJobType, selectedExp, sortBy]);

  const activeFiltersCount = [
    selectedLocation !== 'All',
    selectedCategory !== 'All',
    selectedJobType !== 'All',
    selectedExp !== 'All',
    searchTerm !== '',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      
      {/* Top Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
            
            <div className="relative flex-1 flex items-center">
              <FaSearch className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Role, skills, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    updateParams({ search: '' });
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="relative sm:w-64 flex items-center">
              <FaMapMarkerAlt className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Location / City"
                value={selectedLocation === 'All' ? '' : selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value || 'All')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Search</span>
            </button>

            {/* Mobile Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="sm:hidden px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <FaSlidersH className="text-xs" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-start gap-8">
          
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border border-slate-200 rounded-xl p-4 sticky top-36 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FaFilter className="text-[10px] text-slate-400" />
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category / Industry */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                {popularLocations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Employment Type</label>
              <div className="space-y-1.5">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleJobTypeChange(type)}
                    className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg text-left transition ${
                      selectedJobType === type
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedJobType === type && <FaCheck className="text-[10px]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Experience Level</label>
              <select
                value={selectedExp}
                onChange={(e) => handleExpChange(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                {experienceLevels.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* MAIN AREA: LISTINGS */}
          <main className="flex-1 min-w-0">
            
            {/* Header: Results count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  {searchTerm ? `Jobs matching "${searchTerm}"` : 'All Available Jobs'}
                </h1>
                <p className="text-xs text-slate-500">
                  Showing <span className="font-bold text-slate-900">{filteredJobs.length}</span> positions
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <FaSortAmountDown className="text-slate-400 text-xs" />
                <span className="text-xs text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Job Title (A-Z)</option>
                  <option value="company">Company Name</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-[11px] text-slate-400 font-semibold">Active:</span>

                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    <span>{selectedCategory}</span>
                    <button onClick={() => handleCategoryChange('All')} className="text-slate-400 hover:text-slate-700">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}

                {selectedLocation !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    <span>{selectedLocation}</span>
                    <button onClick={() => handleLocationChange('All')} className="text-slate-400 hover:text-slate-700">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}

                {selectedJobType !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    <span>{selectedJobType}</span>
                    <button onClick={() => handleJobTypeChange('All')} className="text-slate-400 hover:text-slate-700">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}

                {selectedExp !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                    <span>Exp: {selectedExp}</span>
                    <button onClick={() => handleExpChange('All')} className="text-slate-400 hover:text-slate-700">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-indigo-600 hover:underline font-semibold ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Job Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onQuickApply={(j) => setQuickApplyJob(j)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <p className="text-sm font-bold text-slate-800">No jobs match your criteria</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting your location or keyword filters.</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-3 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
                >
                  Reset all filters
                </button>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white h-full p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50"
                >
                  {popularLocations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Employment Type</label>
                <select
                  value={selectedJobType}
                  onChange={(e) => handleJobTypeChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50"
                >
                  {jobTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Experience</label>
                <select
                  value={selectedExp}
                  onChange={(e) => handleExpChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50"
                >
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply Modal */}
      {quickApplyJob && (
        <Modal
          isOpen={Boolean(quickApplyJob)}
          onClose={() => setQuickApplyJob(null)}
          title={`Apply for ${quickApplyJob.position}`}
          subtitle={`At ${quickApplyJob.companyName} • ${quickApplyJob.location || 'India'}`}
          maxWidth="max-w-xl"
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
