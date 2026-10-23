import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import TopCompanies from '../components/TopCompanies';
import PopularCategories from '../components/PopularCategories';
import JobList from '../Joblist';
import TestimonialsList from '../components/TestimonialsList';
import TestimonialsForm from '../components/Testimonials';
import { Modal } from '../components/ui/Modal';
import ApplyJob from '../components/ApplyJob';
import { Button } from '../components/ui/Button';
import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaUsers,
  FaSearch,
  FaHandshake,
  FaFileAlt,
  FaRocket,
  FaShieldAlt,
  FaBriefcase,
  FaUserCheck,
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);

  const workflowSteps = [
    {
      step: '01',
      title: 'Discover Jobs',
      desc: 'Search vetted positions across industries tailored to your skills, location, and career goals.',
      icon: <FaSearch className="text-indigo-600 text-lg" />,
    },
    {
      step: '02',
      title: 'Build Profile & Resume',
      desc: 'Complete your professional profile and upload an ATS-friendly resume for instant recruiter visibility.',
      icon: <FaFileAlt className="text-indigo-600 text-lg" />,
    },
    {
      step: '03',
      title: 'Apply to Opportunities',
      desc: 'Submit direct applications to verified companies with transparent compensation and zero fees.',
      icon: <FaRocket className="text-indigo-600 text-lg" />,
    },
    {
      step: '04',
      title: 'Track & Get Hired',
      desc: 'Follow live application stages, view recruiter notes, and attend scheduled interview rounds.',
      icon: <FaHandshake className="text-indigo-600 text-lg" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* 1. Signature Hero Section */}
      <HeroSection />

      {/* 2. Hiring Companies Strip */}
      <TopCompanies />

      {/* 3. Browse by Category */}
      <PopularCategories />

      {/* 4. Recommended & Featured Jobs Section */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Job Openings
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Featured Career Opportunities
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-xl">
                Explore verified positions with disclosed salaries, active recruiter consoles, and fast response times.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/jobs')}
              className="w-full sm:w-auto bg-white border-slate-300 text-slate-800 hover:text-indigo-600 hover:border-indigo-500 font-semibold rounded-xl shadow-2xs"
            >
              View All Openings
            </Button>
          </div>

          {/* Job List Component */}
          <JobList
            maxJobs={6}
            showSearch={false}
            onQuickApply={(job) => setSelectedJobForModal(job)}
          />
        </div>
      </section>

      {/* 5. How ZenSolve Works (Candidate Journey) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
              Clear & Transparent Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-display">
              How ZenSolve Moves You Forward
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Four streamlined steps to land your next high-growth role with top organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-md transition duration-200 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-black text-indigo-600/60 group-hover:text-indigo-600 transition-colors font-display">
                    {ws.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                    {ws.icon}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition font-display">
                  {ws.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Employer CTA: Scale Your Team */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
                  <FaBuilding className="text-[10px]" />
                  For Employers & HR Leaders
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 font-display">
                  Hire Verified Talent Across India Faster
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                  Register your organization on ZenSolve to publish openings, access pre-screened candidate profiles, and manage interview pipelines in one centralized recruitment dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500 text-sm flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700">Pre-screened applicants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500 text-sm flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700">Centralized ATS pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500 text-sm flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700">Verified company profile</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3.5">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<FaArrowRight className="text-xs" />}
                    iconPosition="right"
                    onClick={() => navigate('/register?role=employer')}
                    className="rounded-xl shadow-xs font-bold"
                  >
                    Register Organization
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/dashboard/post-job')}
                    className="rounded-xl border-slate-300 text-slate-700 hover:text-slate-900"
                  >
                    Post a Job Opening
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-2xs">
                    <FaBriefcase />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Fast-Track Your Hiring
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set up your recruiter profile in less than 2 minutes. Once reviewed by our admin desk, start receiving qualified candidate submissions immediately.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-500 font-medium">
                    100% Data Isolation • Secure Cloud ATS
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. Candidate Testimonials & Feedback */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              Community Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 font-display">
              Candidate & Recruiter Reviews
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Feedback from candidates and hiring teams who use ZenSolve.
            </p>
          </div>

          <TestimonialsList />

          <div className="mt-12">
            <TestimonialsForm />
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
          maxWidth="max-w-2xl"
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
