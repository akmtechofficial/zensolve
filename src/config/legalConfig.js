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
    provisionalLegalName: "Zensolve Infotech Solution Private Limited",
    verificationStatus: "verified",
    cin: "U78100JH2024PTC021852",
    cinStatus: "verified",
    incorporationDate: "January 15, 2024",
    registeredOfficeAddress: "452, Ramnagar, Bhagalpur Road, Godda, Jharkhand – 814133",
    landmark: "2nd Floor, Bhagalpur Road, Ramnagar, near Railway Station / Godda Block Road, Godda",
    addressStatus: "verified",
    websiteDomain: "infozensolve.in",
    websiteUrl: "https://www.infozensolve.in/",
    operationalStatus: "Active Digital Job Portal",
    directors: [
      { name: "Anand Kumar", designation: "Director", din: "10465254", appointmentDate: "January 15, 2024" },
      { name: "Rupesh Kumar Thakur", designation: "Director", din: "10465255", appointmentDate: "January 15, 2024" },
    ],
  },

  // 2. Communications & Statutory Contact
  contacts: {
    supportEmail: "support@infozensolve.in",
    mcaEmail: "rupeshkumar.uci@gmail.com",
    privacyEmail: "support@infozensolve.in",
    provisionalPrivacyEmail: "support@infozensolve.in",
    privacyEmailStatus: "official",
    phone: "+91 2269622941",
    grievanceContactPerson: "Rupesh Kumar Thakur / Anand Kumar",
    grievanceContactStatus: "active",
    securityEmail: "support@infozensolve.in",
    securityContactStatus: "active",
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
