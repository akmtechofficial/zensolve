import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import TopCompanies from '../components/TopCompanies';
import PopularCategories from '../components/PopularCategories';
import JobList from '../Joblist';
import { Modal } from '../components/ui/Modal';
import ApplyJob from '../components/ApplyJob';
import { FaArrowRight, FaBuilding, FaBriefcase, FaPlus } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const categoriesTab = ['All', 'IT & Software', 'Finance', 'Business', 'Healthcare'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      
      {/* 1. Compact Job Search */}
      <HeroSection />

      {/* 2. Featured Companies Strip */}
      <TopCompanies />

      {/* 3. Recommended & Featured Jobs */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                Featured Jobs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified openings from active recruiters.
              </p>
            </div>

            <Link
              to="/jobs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              <span>View all jobs</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <JobList
            maxJobs={6}
            showSearch={false}
            onQuickApply={(job) => setSelectedJobForModal(job)}
          />

        </div>
      </section>

      {/* 4. Latest Jobs by Category */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                Latest Openings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filtered by domain and specialization.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categoriesTab.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeCategoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <JobList
            maxJobs={6}
            filterCategory={activeCategoryFilter === 'All' ? undefined : activeCategoryFilter}
            showSearch={false}
            onQuickApply={(job) => setSelectedJobForModal(job)}
          />

        </div>
      </section>

      {/* 5. Popular Categories */}
      <PopularCategories />

      {/* 6. Compact Employer Callout */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                For Employers & HR Teams
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-display">
                Looking to hire top talent across India?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Register your organization to publish vacancies, access candidate resumes, and manage hiring stages.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/signup/company"
                className="px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition"
              >
                <FaPlus className="text-[10px]" />
                <span>Post a Job Free</span>
              </Link>
              <Link
                to="/hr"
                className="px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                HR Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Apply Modal */}
      {selectedJobForModal && (
        <Modal
          isOpen={Boolean(selectedJobForModal)}
          onClose={() => setSelectedJobForModal(null)}
          title={`Apply for ${selectedJobForModal.position}`}
          subtitle={`At ${selectedJobForModal.companyName} • ${selectedJobForModal.location || 'India'}`}
          maxWidth="max-w-xl"
        >
          <ApplyJob
            job={selectedJobForModal}
            onSuccess={() => {
              setSelectedJobForModal(null);
              navigate('/thank-you', {
                state: {
                  jobPosition: selectedJobForModal.position,
                  companyName: selectedJobForModal.companyName,
                },
              });
            }}
          />
        </Modal>
      )}

    </div>
  );
};

export default Home;
