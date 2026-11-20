import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const locationShortcuts = [
  { label: 'Bengaluru', param: 'location=Bengaluru' },
  { label: 'Delhi NCR', param: 'location=Delhi NCR' },
  { label: 'Mumbai', param: 'location=Mumbai' },
  { label: 'Hyderabad', param: 'location=Hyderabad' },
  { label: 'Pune', param: 'location=Pune' },
  { label: 'Remote', param: 'location=Remote' },
];

const categoryShortcuts = [
  { label: 'Software', param: 'search=Software' },
  { label: 'Sales', param: 'search=Sales' },
  { label: 'Finance', param: 'search=Finance' },
  { label: 'Marketing', param: 'search=Marketing' },
  { label: 'Field Operations', param: 'search=Field' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('search', keyword.trim());
    if (location.trim() && location !== 'All') params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <section className="bg-white border-b border-slate-200 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Find jobs across India
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search thousands of openings from verified companies and recruitment partners.
          </p>
        </div>

        {/* Compact Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl border border-slate-300 p-2 sm:p-2.5 shadow-sm hover:border-slate-400 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/10 transition"
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            
            {/* Input 1: Role / Skill / Company */}
            <div className="relative flex-1 flex items-center">
              <FaSearch className="absolute left-3.5 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Job title, skill, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                aria-label="Job title, skill, or company"
              />
            </div>

            <div className="hidden sm:block w-px bg-slate-200 my-1" />

            {/* Input 2: Location */}
            <div className="relative flex-1 flex items-center">
              <FaMapMarkerAlt className="absolute left-3.5 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="City, state, or 'Remote'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                aria-label="Location"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition flex-shrink-0 cursor-pointer shadow-xs"
            >
              <span>Search Jobs</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </form>

        {/* Actionable Clickable Filter Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Popular:</span>
          
          {locationShortcuts.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(`/jobs?${item.param}`)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 font-medium transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {categoryShortcuts.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(`/jobs?${item.param}`)}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/60 font-medium transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
