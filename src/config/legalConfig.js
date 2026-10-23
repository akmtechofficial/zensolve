/**
 * ZenSolve Legal & Privacy Configuration
 * 
 * IMPORTANT COMPLIANCE NOTICE:
 * Values marked with status 'pending_verification', 'unknown', or 'unconfirmed'
 * represent provisional owner-supplied details, NOT independently verified statutory facts.
 * Do not present unverified details as certified legal truth in public notices.
 */

export const LEGAL_CONFIG = {
  // 1. Identity & Corporate Entity
  entity: {
    displayName: "ZenSolve",
    provisionalLegalName: "Zensolve infotech solution Pvt. Ltd",
    verificationStatus: "pending_verification", // pending_verification | verified | unknown
    cin: "UNKNOWN", // Explicitly unknown until certificate of incorporation is audited
    cinStatus: "unknown",
    registeredOfficeAddress: "Hsda - Mahagama 4 lane Zero mile Godda, Jharkhand, India",
    addressStatus: "pending_verification",
    websiteDomain: "infozensolve.in",
    operationalStatus: "Active Digital Job Portal",
  },

  // 2. Communications & Statutory Contact
  contacts: {
    provisionalPrivacyEmail: "carezensolve@gmail.com",
    privacyEmailStatus: "owner_supplied_provisional",
    supportEmail: "carezensolve@gmail.com",
    grievanceContactPerson: "Not Confirmed / Formal Statutory Appointment Pending",
    grievanceContactStatus: "unconfirmed",
    securityEmail: "carezensolve@gmail.com",
    securityContactStatus: "provisional",
  },

  // 3. Technical & Processor Environment
  processors: {
    analyticsMeasurementId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || null,
    analyticsStatus: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) ? "configured" : "unconfigured",
    hostingProvider: "Firebase Hosting / Google Cloud",
    authProvider: "Firebase Authentication (Passwordless Email Link & Google OAuth)",
    databaseProvider: "Google Cloud Firestore",
    storageProvider: "Google Cloud Storage (Private Resumes & Public Logos)",
    emailProvider: "Firebase Auth Email Dispatch (Custom SMTP/Transactional Email pending audit)",
    paidServices: false, // Explicitly no paid plans / transactions currently
  },

  // 4. Governance Policies
  policies: {
    ageEligibility: {
      intendedAudience: "Adults (18+ years of age)",
      status: "requires_confirmation", // requires_confirmation | legally_verified
      under18Supported: false,
    },
    dataRetention: {
      status: "requires_review", // requires_review | approved
      note: "Data retention schedules exist in operational draft and require formal statutory review under DPDP Act 2023.",
      provisionalCandidateRetentionMonths: 24, // provisional pending inactivity review
      provisionalApplicationRetentionMonths: 36, // provisional
    },
    resumeVisibility: {
      rule: "Restricted strictly to the candidate and authorized hiring companies only after an application is submitted.",
      status: "enforced",
    },
  },

  // 5. Legal Documents Registry
  documents: {
    termsOfService: {
      id: "terms",
      title: "Terms and Conditions of Service",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/terms",
    },
    privacyPolicy: {
      id: "privacy",
      title: "Privacy Notice & Data Protection Policy",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/privacy",
    },
    cookiePolicy: {
      id: "cookies",
      title: "Cookie Policy & Tracking Technologies",
      version: "1.0-published",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "published",
      path: "/cookies",
    },
    securityDisclosure: {
      id: "security",
      title: "Security & Vulnerability Disclosure Program",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/security",
    },
    acceptableUse: {
      id: "acceptable-use",
      title: "Job Posting & Acceptable Use Policy",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/acceptable-use",
    },
    candidateTerms: {
      id: "candidate-terms",
      title: "Candidate Terms & Resume Sharing Policy",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/candidate-terms",
    },
    employerTerms: {
      id: "employer-terms",
      title: "Employer & Recruiter Service Terms",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/employer-terms",
    },
    dataRetentionPolicy: {
      id: "data-retention",
      title: "Data Retention & Storage Schedule",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/data-retention",
    },
    dataDeletion: {
      id: "data-deletion",
      title: "Data Erasure & Account Deletion Request",
      version: "1.0-published",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "published",
      path: "/data-deletion",
    },
    reportFraud: {
      id: "report-fraud",
      title: "Report Job Fraud & Scam Prevention Guide",
      version: "1.0-published",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "published",
      path: "/report-fraud",
    },
    grievanceRedressal: {
      id: "grievance-redressal",
      title: "Grievance Redressal & Support Escalation",
      version: "1.0-draft",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "needs_legal_review",
      path: "/grievance-redressal",
    },
    disclaimer: {
      id: "disclaimer",
      title: "Platform Disclaimer & Limitation of Liability",
      version: "1.0-published",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "published",
      path: "/disclaimer",
    },
    accessibility: {
      id: "accessibility",
      title: "Accessibility Statement",
      version: "1.0-published",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "published",
      path: "/accessibility",
    },
    intellectualProperty: {
      id: "intellectual-property",
      title: "Intellectual Property & Copyright Policy",
      version: "1.0-published",
      effectiveDate: "2026-04-01",
      reviewDate: "2026-10-22",
      status: "published",
      path: "/intellectual-property",
    },
  },
};
