import React from 'react';
import { useNavigate } from 'react-router-dom';
import JobList from '../../Joblist';
import { Button } from '../../components/ui/Button';
import { FaArrowLeft, FaBriefcase } from 'react-icons/fa';

const CategoryTemplate = ({ title, categoryName, description, icon }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back button */}
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <FaArrowLeft />
          <span>All Career Categories</span>
        </button>

        {/* Header */}
        <div className="glass-panel bg-white/95 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                <FaBriefcase className="text-[10px]" />
                <span>Industry Sector</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                {title}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {description || `Browse verified career positions and openings in ${categoryName}.`}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/jobs')}
          >
            Filter All Openings
          </Button>
        </div>

        {/* JobList filtered for this category */}
        <JobList filterCategory={categoryName} showSearch={true} />

      </div>
    </div>
  );
};

export default CategoryTemplate;
