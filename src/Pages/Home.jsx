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
  FaStar,
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
      
      {/* Ambient Subtle Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] bg-cover bg-center mix-blend-multiply z-0"
        style={{ backgroundImage: "url('/images/glass_ambient_backdrop.jpg')" }}
      />

      <div className="relative z-10">
        {/* 1. Signature Hero Section with Asset A */}
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
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface-1 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Openings
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                  Featured Career Opportunities
                </h2>
                <p className="text-slate-600 text-base mt-2 max-w-xl">
                  Explore recently posted roles with competitive compensation, verified company credentials, and fast response times.
                </p>
              </div>

              <Button
                variant="outline"
                size="md"
                icon={<FaArrowRight className="text-xs" />}
                iconPosition="right"
                onClick={() => navigate('/jobs')}
                className="mt-4 md:mt-0 glass-surface-1 rounded-2xl border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-slate-900 shadow-sm"
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
        <section className="py-24 border-y border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 px-3.5 py-1 rounded-full glass-surface-1 border border-indigo-200 shadow-sm">
                Streamlined Glass Process
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 font-display">
                How ZenSolve Accelerates Your Career
              </h2>
              <p className="text-slate-600 text-base mt-3">
                We eliminate friction from the hiring process with transparent requirements and direct employer connectivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((ws) => (
                <div
                  key={ws.step}
                  className="glass-surface-2 glass-specular glass-card-interactive p-6 sm:p-7 rounded-3xl border border-slate-200/90 relative group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-indigo-600/70 group-hover:text-indigo-600 transition-colors font-display">
                      {ws.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl glass-surface-1 border border-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-400 transition shadow-sm">
                      {ws.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">
                    {ws.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 6. Employer Recruitment Showcase with Asset C (Editorial Team Photography) */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden glass-surface-3 glass-specular border border-slate-200/90 p-8 sm:p-12 shadow-xl">
              
              {/* Ambient backlight */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                
                {/* Left Column: Employer Proposition */}
                <div className="lg:col-span-7">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface-1 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4 shadow-sm">
                    <FaBuilding className="text-xs" />
                    For Recruiters & Enterprise Hiring Teams
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 font-display leading-[1.15]">
                    Scale Your High-Performance Teams with Verified Talent
                  </h2>
                  <p className="text-slate-600 text-base leading-relaxed mb-6">
                    Join hundreds of registered enterprises using ZenSolve's multi-company HR recruitment dashboard. Post openings, filter pre-screened applicants, and conduct candidate reviews in one centralized glass SaaS portal.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                        <FaCheckCircle />
                      </div>
                      <span className="text-sm text-slate-700">100% Verified applicant credentials and portfolio links</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                        <FaCheckCircle />
                      </div>
                      <span className="text-sm text-slate-700">Integrated multi-stage applicant tracking system (ATS)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                        <FaCheckCircle />
                      </div>
                      <span className="text-sm text-slate-700">Custom company profile page showcasing your engineering culture</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<FaArrowRight className="text-xs" />}
                      iconPosition="right"
                      onClick={() => navigate('/dashboard/post-job')}
                      className="rounded-2xl shadow-glow-sm"
                    >
                      Post a Job Opening
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/register?role=employer')}
                      className="rounded-2xl glass-surface-1 border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-slate-900 shadow-sm"
                    >
                      Register Company Profile
                    </Button>
                  </div>
                </div>

                {/* Right Column: Asset C (workplace_editorial_team.jpg) in Glass Frame */}
                <div className="lg:col-span-5 relative">
                  <div className="glass-surface-2 glass-specular p-3 rounded-3xl border border-slate-200/90 shadow-xl relative group">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/2]">
                      <img
                        src="/images/workplace_editorial_team.jpg"
                        alt="ZenSolve Modern Workplace Team"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Floating Metric Badge */}
                      <div className="absolute bottom-3 left-3 right-3 glass-surface-3 glass-specular p-3 rounded-xl border border-white/20 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">
                              <FaStar />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">98% Recruiter Satisfaction</p>
                              <p className="text-[10px] text-slate-200">Across 200+ Enterprise Partners</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 7. Testimonials & Candidate Feedback */}
        <section className="py-24 border-t border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 px-3.5 py-1 rounded-full glass-surface-1 border border-amber-200 shadow-sm">
                Proven Placement Impact
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 font-display">
                What Candidates & Recruiters Say
              </h2>
              <p className="text-slate-600 text-base mt-3">
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
    </div>
  );
};

export default Home;
