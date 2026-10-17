import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/useAuth';
import {
  getCandidateApplications,
  withdrawApplication,
} from '../../services/recruitmentService';
import CandidateLayout from './CandidateLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FaBriefcase,
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaBuilding,
  FaArrowRight,
  FaUndo,
  FaExclamationTriangle,
} from 'react-icons/fa';

const STATUS_TABS = [
  'All',
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Not Selected',
  'Withdrawn',
];

const CandidateApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchApps = async () => {
    if (user?.uid) {
      setLoading(true);
      const list = await getCandidateApplications(user.uid, user.email);
      setApplications(list);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [user]);

  const handleWithdraw = async (appId, position) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${position}"?`)) {
      return;
    }

    setActionLoading(appId);
    setFeedback(null);
    const result = await withdrawApplication(appId, user.uid);
    if (result.success) {
      setFeedback({ type: 'success', text: `Application for "${position}" withdrawn.` });
      await fetchApps();
    } else {
      setFeedback({ type: 'error', text: result.error || 'Failed to withdraw application.' });
    }
    setActionLoading(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filtered = applications.filter((app) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Not Selected'
        ? app.status === 'Rejected'
        : app.status?.toLowerCase() === activeTab.toLowerCase();

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      app.jobPosition?.toLowerCase().includes(q) ||
      app.companyName?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="purple">Interview Scheduled</Badge>;
      case 'Selected':
        return <Badge variant="verified">Selected</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Not Selected</Badge>;
      case 'Withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge variant="primary">Applied</Badge>;
    }
  };

  return (
    <CandidateLayout
      title="Application Pipeline"
      subtitle="Monitor your job application statuses, interviews, and historical submissions."
    >
      <div className="space-y-6">
        
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="glass-surface-2 p-4 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="glass-surface-2 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden bg-white/95">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              Loading your application history...
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((app) => {
                const canWithdraw = app.status === 'Applied' || app.status === 'Under Review';
                const appliedDate = app.appliedAt?.toDate
                  ? app.appliedAt.toDate().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/candidate/applications/${app.id}`}
                          className="text-base font-bold text-slate-900 font-display hover:text-indigo-600 transition"
                        >
                          {app.jobPosition || 'Role Position'}
                        </Link>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="font-semibold text-indigo-600 flex items-center gap-1">
                          <FaBuilding className="text-[11px]" />
                          <span>{app.companyName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-[11px] text-slate-400" />
                          <span>Applied on {appliedDate}</span>
                        </span>
                        {app.location && (
                          <>
                            <span>•</span>
                            <span>{app.location}</span>
                          </>
                        )}
                      </div>

                      {app.interview && (
                        <div className="mt-2 p-2.5 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-900 inline-block">
                          <span className="font-bold">Interview Scheduled: </span>
                          <span>
                            {app.interview.date} at {app.interview.time} ({app.interview.type})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {canWithdraw && (
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={actionLoading === app.id}
                          onClick={() => handleWithdraw(app.id, app.jobPosition)}
                          className="text-xs text-slate-500 hover:text-rose-600"
                        >
                          Withdraw
                        </Button>
                      )}

                      <Link to={`/candidate/applications/${app.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<FaArrowRight className="text-[10px]" />}
                          iconPosition="right"
                        >
                          Timeline & Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 px-4 text-center space-y-3">
              <FaBriefcase className="text-4xl text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Applications Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab !== 'All'
                  ? `There are no applications currently in "${activeTab}" status.`
                  : 'You have not submitted any job applications yet.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/jobs')}
                className="mt-2"
              >
                Browse Available Jobs
              </Button>
            </div>
          )}
        </div>

      </div>
    </CandidateLayout>
  );
};

export default CandidateApplications;
