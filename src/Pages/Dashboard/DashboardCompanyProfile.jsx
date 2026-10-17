import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../components/useAuth';
import { db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { FaBuilding, FaCheckCircle, FaGlobe, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const DashboardCompanyProfile = () => {
  const { user, userData } = useAuth();

  const [companyInfo, setCompanyInfo] = useState({
    name: userData?.companyName || 'ZenSolve Infotech Solution',
    industry: 'Technology & Consultancy',
    location: 'Patna, Bihar, India',
    teamSize: '50 - 250 Employees',
    founded: '2019',
    website: 'https://zensolve.com',
    logoUrl: '',
    about:
      'Dedicated to providing employment in the private sector through training, business consultancy, IT consultancy, and admission consultancy.',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      if (user?.uid) {
        try {
          const snap = await getDoc(doc(db, 'companies', user.uid));
          if (snap.exists()) {
            setCompanyInfo((prev) => ({ ...prev, ...snap.data() }));
          }
        } catch (err) {
          console.error('Error fetching company details:', err);
        }
      }
    };
    fetchExisting();
  }, [user?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?.uid) {
        await setDoc(doc(db, 'companies', user.uid), {
          ...companyInfo,
          updatedAt: new Date(),
        }, { merge: true });

        // Update user doc as well
        await updateDoc(doc(db, 'users', user.uid), {
          companyName: companyInfo.name,
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving company profile:', err);
      alert('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Company Brand Profile Editor"
      subtitle="Manage your company's public identity, branding, and recruiting credentials."
    >
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FaBuilding className="text-indigo-400" />
              <span>Identity & Organization</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={companyInfo.logoUrl}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, logoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Headquarters City
                </label>
                <input
                  type="text"
                  value={companyInfo.location}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Team Size
                </label>
                <input
                  type="text"
                  value={companyInfo.teamSize}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, teamSize: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Founded Year
                </label>
                <input
                  type="text"
                  value={companyInfo.founded}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, founded: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                About / Overview Description
              </label>
              <textarea
                value={companyInfo.about}
                onChange={(e) => setCompanyInfo({ ...companyInfo, about: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
              <FaCheckCircle />
              <span>Company profile updated successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full sm:w-auto px-8"
          >
            Save Profile
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCompanyProfile;
