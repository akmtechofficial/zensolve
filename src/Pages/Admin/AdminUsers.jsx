import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAllUsers, toggleUserSuspension } from '../../services/recruitmentService';
import { useAuth } from '../../components/useAuth';
import {
  FaUsers,
  FaSearch,
  FaUserShield,
  FaUserTie,
  FaUserGraduate,
  FaBan,
  FaCheckCircle,
} from 'react-icons/fa';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'candidate' | 'company' | 'admin'
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (targetUser) => {
    const isCurrentlySuspended = targetUser.suspended || targetUser.status === 'suspended';
    const newSuspendedState = !isCurrentlySuspended;

    if (
      !window.confirm(
        `Are you sure you want to ${
          newSuspendedState ? 'suspend' : 'reactivate'
        } user ${targetUser.email || targetUser.displayName}?`
      )
    ) {
      return;
    }

    setActionLoading(targetUser.id);
    try {
      const res = await toggleUserSuspension(
        targetUser.id,
        newSuspendedState,
        user?.email || 'admin@zensolve.com'
      );
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? {
                  ...u,
                  suspended: newSuspendedState,
                  status: newSuspendedState ? 'suspended' : 'active',
                }
              : u
          )
        );
      } else {
        alert(res.error || 'Failed to update user suspension status.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = (u.displayName || u.name || u.companyName || '').toLowerCase().includes(query);
    const emailMatch = (u.email || '').toLowerCase().includes(query);

    if (!nameMatch && !emailMatch) return false;

    if (roleFilter === 'candidate') {
      return u.role === 'candidate' || !u.role;
    }
    if (roleFilter === 'company') {
      return u.role === 'company' || u.role === 'employer';
    }
    if (roleFilter === 'admin') {
      return u.role === 'admin';
    }
    return true;
  });

  return (
    <AdminLayout
      title="User Accounts & Role Directory"
      subtitle="Inspect verified accounts, identify platform roles, and manage access authorizations."
    >
      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 glass-surface-2 rounded-2xl border border-slate-200/90 overflow-x-auto">
          {[
            { id: 'all', label: 'All Users', count: users.length },
            {
              id: 'candidate',
              label: 'Candidates',
              count: users.filter((u) => u.role === 'candidate' || !u.role).length,
            },
            {
              id: 'company',
              label: 'Employers',
              count: users.filter((u) => u.role === 'company' || u.role === 'employer').length,
            },
            {
              id: 'admin',
              label: 'Administrators',
              count: users.filter((u) => u.role === 'admin').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                roleFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  roleFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-surface-2 glass-specular rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-600 font-medium">
            Fetching platform user roster...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-lg">
              <FaUsers />
            </div>
            <div className="text-sm font-bold text-slate-800">No users found</div>
            <p className="text-xs text-slate-600">Try adjusting your search terms or filter tabs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-4">Role Classification</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90">
                {filteredUsers.map((u) => {
                  const isSuspended = u.suspended || u.status === 'suspended';
                  const role = u.role || 'candidate';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {(u.displayName || u.name || u.companyName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {u.displayName || u.name || u.companyName || 'Anonymous Account'}
                            </div>
                            <div className="text-[11px] text-slate-600">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <FaUserShield className="text-[9px]" /> Super-Admin
                          </span>
                        ) : role === 'company' || role === 'employer' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <FaUserTie className="text-[9px]" /> Corporate Recruiter
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FaUserGraduate className="text-[9px]" /> Job Candidate
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <FaBan className="text-[9px]" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FaCheckCircle className="text-[9px]" /> Active
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-600 text-[11px]">
                        {u.createdAt?.toDate
                          ? u.createdAt.toDate().toLocaleDateString()
                          : 'Recent'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {role !== 'admin' && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            disabled={actionLoading === u.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              isSuspended
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {actionLoading === u.id
                              ? 'Saving...'
                              : isSuspended
                              ? 'Reactivate'
                              : 'Suspend User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
