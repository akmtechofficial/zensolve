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
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);

  const workflowSteps = [
    {
      step: '01',
      title: 'Explore & Discover',
      desc: 'Browse hundreds of verified jobs filtered by role, category, salary, and preferred work mode.',
      icon: <FaSearch className="text-indigo-400 text-xl" />,
    },
    {
      step: '02',
      title: '1-Click Application',
      desc: 'Submit your tailored resume and profile directly to the company hiring team with zero intermediary delay.',
      icon: <FaFileAlt className="text-indigo-400 text-xl" />,
    },
    {
      step: '03',
      title: 'Direct HR Review',
      desc: 'Verified employer recruiters evaluate your credentials and schedule interview stages through the platform.',
      icon: <FaHandshake className="text-indigo-400 text-xl" />,
    },
    {
      step: '04',
      title: 'Get Hired & Excel',
      desc: 'Receive transparent offer letters and accelerate your long-term career trajectory with top organizations.',
      icon: <FaRocket className="text-indigo-400 text-xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Top Companies Hiring Strip */}
      <TopCompanies />

      {/* 3. Popular Job Categories (Bento Grid) */}
      <PopularCategories />

      {/* 4. Featured Jobs Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Live Openings
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Career Opportunities
              </h2>
              <p className="text-slate-400 text-base mt-2 max-w-xl">
                Explore recently posted roles with competitive compensation, verified company credentials, and fast response times.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              icon={<FaArrowRight className="text-xs" />}
              iconPosition="right"
              onClick={() => navigate('/jobs')}
              className="mt-4 md:mt-0"
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

      {/* 5. How ZenSolve Works (Workflow Section) */}
      <section className="py-20 border-y border-slate-850 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Streamlined Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
              How ZenSolve Accelerates Your Career
            </h2>
            <p className="text-slate-400 text-base mt-3">
              We eliminate friction from the hiring process with transparent requirements and direct employer connectivity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 relative group hover:border-indigo-500/40 hover:bg-slate-900/90 transition duration-300"
              >
                <div className="text-3xl font-black text-slate-800 group-hover:text-indigo-500/20 transition-colors font-display mb-4">
                  {ws.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  {ws.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition">
                  {ws.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Employer Recruitment CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-indigo-500/30 p-8 sm:p-14 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
                <FaBuilding className="text-xs" />
                For Recruiters & Enterprise Hiring
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-display">
                Looking to Hire Top Verified Talent Fast?
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                Join hundreds of registered companies using ZenSolve's multi-company HR recruitment dashboard. Post openings, filter applicants, and schedule candidate reviews in one centralized SaaS portal.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<FaArrowRight className="text-xs" />}
                  iconPosition="right"
                  onClick={() => navigate('/dashboard/post-job')}
                >
                  Post a Job Opening
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/register?role=employer')}
                >
                  Register Company Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials & Candidate Feedback */}
      <section className="py-20 border-t border-slate-850 bg-slate-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              Proven Placement Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
              What Candidates & Recruiters Say
            </h2>
            <p className="text-slate-400 text-base mt-3">
              Genuine feedback from professionals who accelerated their careers through ZenSolve.
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
