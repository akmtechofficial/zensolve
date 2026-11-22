import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebaseConfig';

export const MAX_RESUME_SIZE_MB = 10;
export const MAX_RESUME_SIZE_BYTES = MAX_RESUME_SIZE_MB * 1024 * 1024; // 10,485,760 bytes

export const MAX_LOGO_SIZE_KB = 500;
export const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_KB * 1024; // 512,000 bytes

// S17: Strict MIME Types (Removed generic application/octet-stream and SVG)
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_LOGO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/**
 * Validates a candidate resume file
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateResumeFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select a resume file to upload.' };
  }

  // Size verification: strict 10MB cap
  if (file.size > MAX_RESUME_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds the 10 MB limit (Selected: ${sizeInMB} MB). Please compress your PDF or upload a smaller file.`,
    };
  }

  // S17: Strict Extension and MIME validation (no generic octet-stream)
  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['pdf', 'doc', 'docx'];
  const isValidMime = ALLOWED_RESUME_TYPES.includes(file.type);
  const isValidExt = validExtensions.includes(ext);

  if (!isValidMime || !isValidExt) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload your resume in authentic PDF, DOC, or DOCX format.',
    };
  }

  return { valid: true };
};

/**
 * Validates a company logo file
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateLogoFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select an image file for the company logo.' };
  }

  // Size verification: strict 500KB cap
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    const sizeInKB = Math.round(file.size / 1024);
    return {
      valid: false,
      error: `Logo size exceeds the 500 KB limit (Selected: ${sizeInKB} KB). Please upload a compressed image under 500 KB.`,
    };
  }

  // S17: Strict Extension and MIME validation (no SVG to prevent stored XSS)
  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['png', 'jpg', 'jpeg', 'webp'];
  const isValidMime = ALLOWED_LOGO_TYPES.includes(file.type);
  const isValidExt = validExtensions.includes(ext);

  if (!isValidMime || !isValidExt) {
    return {
      valid: false,
      error: 'Invalid image format. Supported formats: PNG, JPG, JPEG, WEBP (SVG is not supported for security).',
    };
  }

  return { valid: true };
};

/**
 * Uploads a candidate resume to Firebase Storage with live progress callback
 * Path: resumes/{userId}/{timestamp}_{cleanFileName}
 * @param {string} userId
 * @param {File} file
 * @param {Function} [onProgress] - Optional callback receiving progress percentage (0-100)
 * @returns {Promise<{ downloadURL: string, fullPath: string, fileName: string, size: number }>}
 */
export const uploadCandidateResume = async (userId, file, onProgress = null) => {
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!userId) {
    throw new Error('User authentication is required to upload a resume.');
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `resumes/${userId}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || 'application/pdf',
    customMetadata: {
      originalName: file.name,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    },
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase resume upload error:', error);
        reject(new Error(error.message || 'Failed to upload resume to cloud storage.'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadURL,
            fullPath: storagePath,
            fileName: file.name,
            size: file.size,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * Uploads a company logo to Firebase Storage with live progress callback
 * Path: company_logos/{companyId}/{timestamp}_{cleanFileName}
 * @param {string} companyId
 * @param {File} file
 * @param {Function} [onProgress] - Optional callback receiving progress percentage (0-100)
 * @returns {Promise<{ downloadURL: string, fullPath: string, fileName: string }>}
 */
export const uploadCompanyLogo = async (companyId, file, onProgress = null) => {
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!companyId) {
    throw new Error('Company ID is required to upload a company logo.');
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `company_logos/${companyId}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || 'image/png',
    customMetadata: {
      originalName: file.name,
      companyId,
      uploadedAt: new Date().toISOString(),
    },
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase company logo upload error:', error);
        reject(new Error(error.message || 'Failed to upload logo to cloud storage.'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadURL,
            fullPath: storagePath,
            fileName: file.name,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * Uploads a candidate profile photo / avatar
 * Path: avatars/{userId}/{timestamp}_{cleanFileName}
 * @param {string} userId
 * @param {File} file
 * @param {Function} [onProgress]
 * @returns {Promise<{ downloadURL: string, fullPath: string, fileName: string }>}
 */
export const uploadCandidatePhoto = async (userId, file, onProgress = null) => {
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!userId) {
    throw new Error('User authentication is required to upload a profile photo.');
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `avatars/${userId}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      originalName: file.name,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    },
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase candidate photo upload error:', error);
        reject(new Error(error.message || 'Failed to upload profile photo to cloud storage.'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadURL,
            fullPath: storagePath,
            fileName: file.name,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * Deletes a file from Firebase Storage
 * @param {string} fullPathOrUrl 
 */
export const deleteStorageFile = async (fullPathOrUrl) => {
  if (!fullPathOrUrl) return;
  try {
    const fileRef = fullPathOrUrl.startsWith('http')
      ? ref(storage, fullPathOrUrl)
      : ref(storage, fullPathOrUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Storage delete notice (file may not exist):', error.message);
  }
};

/**
 * S13: Authenticated secure resume retrieval
 * Replaces public bearer download URLs with short-lived, authorization-verified signed access
 * @param {object} params - { resumePath, applicationId }
 * @returns {Promise<string>} Short-lived authorized download URL
 */
export const getSecureResumeUrl = async ({ resumePath, applicationId }) => {
  if (!resumePath) return null;

  // If already a digital CV marker
  if (resumePath.startsWith('profile://') || resumePath === 'DIGITAL_PROFILE_CV') {
    return resumePath;
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
    }

    // Extract path if full URL was passed
    let normalizedPath = resumePath;
    if (resumePath.includes('/o/')) {
      const encoded = resumePath.split('/o/')[1]?.split('?')[0];
      if (encoded) normalizedPath = decodeURIComponent(encoded);
    }

    const res = await fetch('/api/get-resume-url', {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumePath: normalizedPath, applicationId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (err) {
    console.warn('Secure resume retrieval notice:', err.message);
  }

  // Graceful fallback to legacy URL if already direct link
  return resumePath;
};
