import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../components/useAuth';
import { Button } from '../../components/ui/Button';
import { db, storage } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  FaBuilding,
  FaGlobe,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaUpload,
  FaCalendarAlt,
  FaExclamationCircle,
} from 'react-icons/fa';

const DashboardCompanyProfile = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    teamSize: '',
    founded: '',
    about: '',
    logoUrl: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        setFetching(true);
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setCompanyInfo({
            name: data.companyName || data.displayName || '',
            industry: data.industry || 'Technology & Services',
            location: data.location || '',
            website: data.website || '',
            teamSize: data.teamSize || data.companySize || '',
            founded: data.founded || data.foundedYear || '',
            about: data.description || data.about || '',
            logoUrl: data.logo || data.companyLogo || '',
          });
        }
      } catch (err) {
        console.error('Failed to load company profile:', err);
        setErrorMsg('Failed to fetch existing profile details.');
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Logo file size must be less than 5 MB.');
      return;
    }

    setErrorMsg('');
    const storageRef = ref(storage, `companies/${user.uid}/logo_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Logo upload error:', error);
        setErrorMsg('Failed to upload logo: ' + error.message);
        setUploadProgress(0);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setCompanyInfo((prev) => ({ ...prev, logoUrl: downloadUrl }));
        setUploadProgress(0);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          companyName: companyInfo.name,
          displayName: companyInfo.name,
          industry: companyInfo.industry,
          location: companyInfo.location,
          website: companyInfo.website,
          teamSize: companyInfo.teamSize,
          companySize: companyInfo.teamSize,
          founded: companyInfo.founded,
          foundedYear: companyInfo.founded,
          about: companyInfo.about,
          description: companyInfo.about,
          logo: companyInfo.logoUrl,
          companyLogo: companyInfo.logoUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving company profile:', err);
      setErrorMsg(err.message || 'Failed to save company profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Company Brand Profile"
      subtitle="Customize how your organization appears to job seekers on public career listings."
    >
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="glass-surface-2 glass-specular p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold shadow-xs">1</span>
              <span>General Organization Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Company Logo
                </label>
                <div className="flex items-center gap-3">
                  {companyInfo.logoUrl ? (
                    <img
                      src={companyInfo.logoUrl}
                      alt="Logo preview"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <FaBuilding />
                    </div>
                  )}
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition flex items-center gap-1.5">
                    <FaUpload className="text-xs" />
                    <span>{uploadProgress > 0 ? `Uploading (${uploadProgress}%)` : 'Upload New'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadProgress > 0}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Headquarters City
                </label>
                <input
                  type="text"
                  value={companyInfo.location}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Team Size
                </label>
                <input
                  type="text"
                  value={companyInfo.teamSize}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, teamSize: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Founded Year
                </label>
                <input
                  type="text"
                  value={companyInfo.founded}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, founded: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                About / Overview Description
              </label>
              <textarea
                value={companyInfo.about}
                onChange={(e) => setCompanyInfo({ ...companyInfo, about: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-slate-900 font-medium focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2">
              <FaExclamationCircle />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl flex items-center gap-2">
              <FaCheckCircle />
              <span>Company profile updated successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full sm:w-auto px-8 rounded-2xl shadow-glow-sm"
          >
            Save Profile Changes
          </Button>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCompanyProfile;
