# ZenSolve — Next-Generation Multi-Company HR Recruitment Platform

A modern, high-performance recruitment portal and multi-company HR SaaS platform designed with elite UI/UX aesthetics inspired by [Aceternity UI](https://ui.aceternity.com/), Linear, and modern enterprise hiring software.

---

## ✨ Features & Capabilities

### 🌐 Public Job Seekers Experience
- **"Make Career With Us" Hero**: Aceternity Spotlight effect, ambient background tech beams, and an integrated multi-facet search bar (role, skills, category, and location).
- **Public Job Discovery (`/jobs`)**: Filter by domain, employment type (Full-time, Part-time, Remote, Contract), location, experience level, and salary sorting.
- **Brand Company Profiles (`/company/:companyName`)**: Dedicated brand pages showcasing verified credentials, company overview, team metrics, and active openings.
- **Company Directory (`/companies`)**: Explore all verified hiring partner organizations across India.
- **1-Click Quick Apply & Details**: Interactive drawer/modal with drag-and-drop resume upload, progress indicator, and validation.
- **Candidate Bookmarks (`/saved-jobs`)**: Save positions directly to your candidate profile in Firestore.
- **Specialized Industry Categories (`/categories/*`)**: Bento Grid navigation for IT & Software, Finance, Healthcare, Business, Construction, Logistics, Education, and Teaching.

### 💼 HR SaaS Recruiter Console (`/dashboard`)
- **Console Overview (`/dashboard`)**: Real-time hiring metrics (Active Openings, Total Applicants, Shortlisted, Pending Review), recent submissions table, and quick actions.
- **Job Listings Management (`/dashboard/jobs`)**: Searchable data table with live status toggling (Active/Closed), modal editor, and delete actions.
- **Job Posting Studio (`/dashboard/post-job`)**: Form with live candidate card preview that dynamically reflects your changes in real-time.
- **Candidate Application Pipeline (`/dashboard/applicants`)**: Filter candidates by status (`Pending`, `Reviewed`, `Shortlisted`, `Rejected`, `Hired`), view/download resumes, and update stages directly in Firestore.
- **Company Profile Editor (`/dashboard/company-profile`)**: Manage your company's public identity, branding, logo, and headquarters.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Framer Motion
- **Styling**: Tailwind CSS, Aceternity UI Design System, Custom Glassmorphism
- **Backend & Cloud**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Build & Dev Tooling**: Vite with lightning-fast HMR

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📄 License
All rights reserved © ZenSolve Infotech Solution Private Limited.
