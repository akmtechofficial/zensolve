import React, { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  resendVerificationReminder,
  getDailyReminderStatus,
} from '../services/notificationService';
import { FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';

const ResendApprovalReminder = ({ compact = false }) => {
  const { user, userData, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reminderInfo, setReminderInfo] = useState(() => {
    return getDailyReminderStatus(user?.uid, userData);
  });

  useEffect(() => {
    if (user?.uid) {
      setReminderInfo(getDailyReminderStatus(user.uid, userData));
    }
  }, [user?.uid, userData]);

  const handleResend = async () => {
    if (!user?.uid || loading || !reminderInfo.canSend) return;

    setLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const payload = {
      uid: user.uid,
      companyName: userData?.companyName || userData?.companyData?.companyName || 'Registered Employer',
      hrName: userData?.hrName || userData?.displayName || 'HR Manager',
      email: user.email || userData?.businessEmail,
      phone: userData?.phone || userData?.mobileNumber || '',
      companyType: userData?.companyType || 'Private Limited',
      industry: userData?.industry || 'Technology & Services',
      location: userData?.location || 'India',
      website: userData?.website || '',
    };

    const res = await resendVerificationReminder(payload, userData);
    setLoading(false);

    if (res.success) {
      setStatusMsg(res.message);
      setReminderInfo(getDailyReminderStatus(user.uid, {
        ...userData,
        lastReminderDate: reminderInfo.today,
        remindersSentToday: res.countToday,
      }));
      if (refreshUser) refreshUser();
    } else {
      setErrorMsg(res.error);
    }
  };

  if (!user) return null;

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={loading || !reminderInfo.canSend}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
            reminderInfo.canSend
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
          title={reminderInfo.canSend ? 'Send expedited reminder email to ZenSolve office' : 'Daily limit of 3 reminders reached'}
        >
          {loading ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaPaperPlane className="text-[10px]" />
          )}
          <span>
            {reminderInfo.canSend
              ? `Resend Email to Office (${reminderInfo.remaining}/3 left today)`
              : 'Daily Limit Reached (3/3 sent)'}
          </span>
        </button>

        {statusMsg && (
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <FaCheckCircle className="text-[11px]" />
            <span>Reminder sent!</span>
          </span>
        )}
        {errorMsg && (
          <span className="text-xs text-rose-700 font-medium">
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-left space-y-3">
      <div className="flex items-start gap-2.5">
        <FaClock className="text-amber-600 text-sm mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
            Need Urgent Approval to Post Jobs?
          </h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            If you need to start hiring immediately, you can notify the ZenSolve verification desk (carezensolve@gmail.com). To avoid spam, this request is limited to <strong>3 times per day</strong>.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-amber-200/60">
        <div className="text-xs text-amber-900 font-medium">
          Remaining daily reminders:{' '}
          <span className="font-bold text-amber-950">
            {reminderInfo.remaining} of {reminderInfo.maxLimit}
          </span>
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading || !reminderInfo.canSend}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
            reminderInfo.canSend
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
          }`}
        >
          {loading ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaPaperPlane className="text-[11px]" />
          )}
          <span>
            {reminderInfo.canSend
              ? 'Resend Email to ZenSolve Office'
              : 'Daily Limit Reached (3/3 sent)'}
          </span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <FaExclamationTriangle className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ResendApprovalReminder;
