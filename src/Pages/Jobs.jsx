import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  FaSortAmountDown,
  FaBuilding,
  FaSlidersH,
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

const popularLocations = ['All', 'Remote', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Patna'];

const Jobs = () => {
  const location = useLocation();
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
        // Exclude closed or drafts from candidate view
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
            if (!job.location || !job.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
              return false;
            }
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
        if (sortBy === 'salaryHigh') {
          return (Number(b.salaryTo) || 0) - (Number(a.salaryTo) || 0);
        }
        if (sortBy === 'salaryLow') {
          return (Number(a.salaryFrom) || 0) - (Number(b.salaryFrom) || 0);
        }
        // default: newest first
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
  }, [allJobs, searchTerm, selectedLocation, selectedCategory, selectedJobType, selectedExp, sortBy]);

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (selectedLocation !== 'All' ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedJobType !== 'All' ? 1 : 0) +
    (selectedExp !== 'All' ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Search Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Keyword Input */}
              <div className="relative flex-1 flex items-center">
                <FaSearch className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, skills or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  aria-label="Search by job title, skills or company"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      updateParams({ search: '' });
                    }}
                    className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-700"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Location Input */}
              <div className="relative flex-1 flex items-center">
                <FaMapMarkerAlt className="absolute left-4 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="City, state or remote"
                  value={selectedLocation === 'All' ? '' : selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value || 'All')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  aria-label="City, state or remote"
                />
              </div>

              {/* Submit & Mobile Filter Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-xs"
                >
                  Find Jobs
                </Button>

                {/* Mobile Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-200"
                  aria-label="Open filter options"
                >
                  <FaSlidersH className="text-xs" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Header: Active Filter Chips & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {searchTerm ? `Jobs matching "${searchTerm}"` : 'All Open Positions'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <span className="font-bold text-slate-900">{filteredJobs.length}</span> published opportunity{filteredJobs.length === 1 ? '' : 'ies'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <FaSortAmountDown className="text-indigo-600" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent font-medium text-slate-800 border-none focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="salaryHigh">Salary: High to Low</option>
                <option value="salaryLow">Salary: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Keywords: "{searchTerm}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    updateParams({ search: '' });
                  }}
                  className="hover:text-indigo-900"
                >
                  <FaTimes size={9} />
                </button>
              </span>
            )}
            {selectedLocation !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Location: {selectedLocation}
                <button
                  type="button"
                  onClick={() => handleLocationChange('All')}
                  className="hover:text-indigo-900"
                >
                  <FaTimes size={9} />
                </button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Category: {selectedCategory}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('All')}
                  className="hover:text-indigo-900"
                >
                  <FaTimes size={9} />
                </button>
              </span>
            )}
            {selectedJobType !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Type: {selectedJobType}
                <button
                  type="button"
                  onClick={() => handleJobTypeChange('All')}
                  className="hover:text-indigo-900"
                >
                  <FaTimes size={9} />
                </button>
              </span>
            )}
            {selectedExp !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Exp: {selectedExp}
                <button
                  type="button"
                  onClick={() => handleExpChange('All')}
                  className="hover:text-indigo-900"
                >
                  <FaTimes size={9} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 ml-2 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Layout Grid: Sidebar Filters (Desktop) + Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (Span 3) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <FaFilter className="text-indigo-600 text-xs" />
                Filter Positions
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Job Category
              </label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Employment Type
              </label>
              <div className="space-y-1.5">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleJobTypeChange(type)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedJobType === type
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedJobType === type && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Experience Level
              </label>
              <div className="space-y-1.5">
                {experienceLevels.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => handleExpChange(exp)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedExp === exp
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{exp}</span>
                    {selectedExp === exp && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Locations */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Popular Locations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationChange(loc)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      selectedLocation === loc
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Job Listings Column (Span 9) */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white p-6 rounded-2xl border border-slate-200/90 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-5 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-slate-200 rounded-full w-20" />
                      <div className="h-6 bg-slate-200 rounded-full w-24" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="h-5 bg-slate-200 rounded w-28" />
                      <div className="h-8 bg-slate-200 rounded-xl w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onQuickApply={(j) => setQuickApplyJob(j)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <FaBriefcase size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">No Matching Openings</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  We couldn't find active positions matching your criteria. Try adjusting keywords or resetting your filter selections.
                </p>
                <Button variant="primary" size="sm" onClick={resetAllFilters} className="rounded-xl shadow-xs">
                  Reset All Filters
                </Button>
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFiltersOpen && (
        <Modal
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          title="Filter Positions"
          subtitle="Narrow results by category, type, and experience."
          maxWidth="max-w-md"
        >
          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Job Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Employment Type
              </label>
              <select
                value={selectedJobType}
                onChange={(e) => handleJobTypeChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
              >
                {jobTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Experience Level
              </label>
              <select
                value={selectedExp}
                onChange={(e) => handleExpChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
              >
                {experienceLevels.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  resetAllFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1"
              >
                Reset All
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
