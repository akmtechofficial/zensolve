import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { adminDb, verifyAuthToken } from './_firebaseAdmin.js';
import { escapeHtml, isSafeUrl } from './_utils.js';
import { checkRateLimit } from './_rateLimiter.js';

dotenv.config();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Rate limit by client IP (max 20 requests per minute) (S03)
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const ipCheck = checkRateLimit(`send_email_ip_${clientIp}`, 20, 60000);
  if (!ipCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  try {
    const { type, payload } = req.body || {};
    if (!type || !payload) {
      return res.status(400).json({ error: 'Missing type or payload.' });
    }

    const emailUser = process.env.EMAIL_USER || 'carezensolve@gmail.com';
    const emailPass = process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'carezensolve@gmail.com';

    if (!emailPass) {
      console.error('EMAIL_PASS environment variable is not configured.');
      return res.status(500).json({ error: 'Mail server credentials are not configured.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const formattedTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    let mailOptions = null;

    // 1. Candidate Applied -> Email to Company (S03: Authenticated & DB verified)
    if (type === 'NEW_APPLICATION') {
      // Authenticate caller (Must be candidate or authorized actor)
      let caller;
      try {
        caller = await verifyAuthToken(req);
      } catch (authErr) {
        return res.status(401).json({ error: 'Unauthorized: Valid authentication required to dispatch application notification.' });
      }

      const {
        jobId,
        applicantName,
        applicantEmail,
        applicantPhone,
        isDigitalProfile,
        notes,
      } = payload;

      if (!jobId) {
        return res.status(400).json({ error: 'Missing jobId in application payload.' });
      }

      // S03: Server-side resolution of target company email from authoritative Firestore DB
      let targetEmail = adminEmail;
      let authoritativeCompanyName = 'Your Organization';
      let authoritativeClientName = '';
      let authoritativePosition = 'Position';

      try {
        const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
        if (jobDoc.exists) {
          const jobData = jobDoc.data();
          authoritativePosition = jobData.position || jobData.title || 'Job Opening';
          authoritativeCompanyName = jobData.companyName || 'Your Agency';
          authoritativeClientName = jobData.clientCompanyName || '';

          if (jobData.companyId) {
            const compDoc = await adminDb.collection('users').doc(jobData.companyId).get();
            if (compDoc.exists) {
              const compData = compDoc.data();
              targetEmail = compData.businessEmail || compData.email || compData.contactEmail || adminEmail;
            }
          }
        }
      } catch (dbErr) {
        console.warn('Authoritative company lookup notice:', dbErr.message);
      }

      // S14: HTML Escape all interpolated strings
      const safeApplicantName = escapeHtml(applicantName || 'Candidate');
      const safeApplicantEmail = escapeHtml(applicantEmail || caller.email || 'Not Provided');
      const safeApplicantPhone = escapeHtml(applicantPhone || 'Not Provided');
      const safePosition = escapeHtml(authoritativePosition);
      const safeCompanyName = escapeHtml(authoritativeCompanyName);
      const safeClientName = escapeHtml(authoritativeClientName);
      const safeNotes = escapeHtml(notes || '');

      const companyPanelLink = `https://infozensolve.in/hr/jobs/${encodeURIComponent(jobId)}/applicants`;
      const subject = `💼 New Application: ${safeApplicantName} applied for ${safePosition}`;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #4f46e5;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">ZenSolve Recruiter Portal</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">New Candidate Application Received</p>
          </div>

          <div style="padding: 24px;">
            <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h2 style="color: #3730a3; margin: 0 0 4px 0; font-size: 16px; font-weight: 700;">
                ${safeApplicantName} applied for ${safePosition}
              </h2>
              <p style="margin: 0; color: #4338ca; font-size: 12px;">
                ${safeClientName ? `Placement at: <strong>${safeClientName}</strong> • ` : ''}Managed by ${safeCompanyName}
              </p>
            </div>

            <h3 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
              Applicant Overview
            </h3>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Full Legal Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${safeApplicantName}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: 600;">
                  <a href="mailto:${safeApplicantEmail}" style="color: #2563eb; text-decoration: none;">${safeApplicantEmail}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Contact Phone:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeApplicantPhone}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">CV Format:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: 700;">
                  ${isDigitalProfile ? 'Verified Digital Profile CV' : 'Uploaded File Resume (PDF)'}
                </td>
              </tr>
              ${safeNotes ? `
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Candidate Note:</td>
                <td style="padding: 6px 0; color: #334155; font-style: italic;">"${safeNotes}"</td>
              </tr>` : ''}
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Submitted At:</td>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px;">${formattedTime}</td>
              </tr>
            </table>

            <div style="margin: 28px 0 16px 0; text-align: center;">
              <a href="${companyPanelLink}" 
                 style="background: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);">
                Click to View Candidate in Company Panel →
              </a>
            </div>

            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">
              Direct Link: <a href="${companyPanelLink}" style="color: #6366f1;">${companyPanelLink}</a>
            </p>
          </div>

          <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Sent by ZenSolve Recruitment Platform for ${safeCompanyName}.
          </div>
        </div>
      `;

      mailOptions = {
        from: `"ZenSolve Recruitment" <${emailUser}>`,
        to: targetEmail,
        bcc: adminEmail,
        subject,
        html: htmlContent,
      };

    // 2. New Company Registered -> Email to Admin
    } else if (type === 'NEW_COMPANY') {
      try {
        await verifyAuthToken(req);
      } catch (authErr) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
      }

      const {
        companyName,
        hrName,
        email,
        phone,
        companyType,
        industry,
        gstNumber,
        location,
      } = payload;

      const safeCompanyName = escapeHtml(companyName || 'New Agency');
      const safeHrName = escapeHtml(hrName || 'Not Provided');
      const safeEmail = escapeHtml(email || 'Not Provided');
      const safePhone = escapeHtml(phone || 'Not Provided');
      const safeIndustry = escapeHtml(industry || 'Staffing & Recruitment');
      const safeCompanyType = escapeHtml(companyType || 'Private Limited');
      const safeGstNumber = escapeHtml(gstNumber || '');
      const safeLocation = escapeHtml(location || 'India');

      const adminPanelLink = 'https://infozensolve.in/admin/companies';
      const subject = `🏢 New Company Registered: ${safeCompanyName} registered on ZenSolve`;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #10b981;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">ZenSolve Superadmin Alert</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">New Employer / Agency Registration</p>
          </div>

          <div style="padding: 24px;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
              <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 700;">
                A new company has registered: ${safeCompanyName}
              </p>
              <p style="margin: 6px 0 0 0; color: #047857; font-size: 12px; line-height: 1.5;">
                Please review their credentials and verify them in the admin console.
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 150px; font-weight: 600;">Company / Agency:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${safeCompanyName}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Authorized Contact:</td>
                <td style="padding: 8px 0; color: #0f172a;">${safeHrName}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Business Email:</td>
                <td style="padding: 8px 0; color: #2563eb; font-weight: 600;">${safeEmail}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Contact Phone:</td>
                <td style="padding: 8px 0; color: #0f172a;">${safePhone}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Industry / Type:</td>
                <td style="padding: 8px 0; color: #0f172a;">${safeIndustry} (${safeCompanyType})</td>
              </tr>
              ${safeGstNumber ? `
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">GSTIN / Reg:</td>
                <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${safeGstNumber}</td>
              </tr>` : ''}
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Operating Location:</td>
                <td style="padding: 8px 0; color: #0f172a;">${safeLocation}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Registered At:</td>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px;">${formattedTime}</td>
              </tr>
            </table>

            <div style="margin: 28px 0 16px 0; text-align: center;">
              <a href="${adminPanelLink}" 
                 style="background: #10b981; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);">
                Click to View & Approve on Admin Panel →
              </a>
            </div>
          </div>
        </div>
      `;

      mailOptions = {
        from: `"ZenSolve Admin Alerts" <${emailUser}>`,
        to: adminEmail,
        subject,
        html: htmlContent,
      };

    // 3. New Job Opening Posted -> Email to Admin
    } else if (type === 'NEW_JOB') {
      try {
        await verifyAuthToken(req);
      } catch (authErr) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
      }

      const {
        position,
        companyName,
        clientCompanyName,
        category,
        vacancies,
        salaryFrom,
        salaryTo,
        workMode,
        location,
        qualification,
        postedBy,
      } = payload;

      const safePosition = escapeHtml(position || 'Job Opening');
      const safeCompanyName = escapeHtml(companyName || 'Agency');
      const safeClientName = escapeHtml(clientCompanyName || safeCompanyName);
      const safeCategory = escapeHtml(category || 'General');
      const safeWorkMode = escapeHtml(workMode || 'In-Office');
      const safeLocation = escapeHtml(location || 'India');
      const safeQualification = escapeHtml(qualification || 'Not Specified');
      const safePostedBy = escapeHtml(postedBy || 'Agency Recruiter');

      const adminJobsLink = 'https://infozensolve.in/admin/jobs';
      const subject = `📢 New Job Posted: ${safePosition} posted by ${safeCompanyName}`;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">ZenSolve Superadmin Alert</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">New Job Opening Published</p>
          </div>

          <div style="padding: 24px;">
            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 700;">
                A new job vacancy has just been published: ${safePosition}
              </p>
              <p style="margin: 6px 0 0 0; color: #b45309; font-size: 12px; line-height: 1.5;">
                Posted by agency <strong>${safeCompanyName}</strong> for client <strong>${safeClientName}</strong>.
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Job Title:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${safePosition}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Hiring Client:</td>
                <td style="padding: 6px 0; color: #4338ca; font-weight: 700;">${safeClientName}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Staffing Agency:</td>
                <td style="padding: 6px 0; color: #0f172a;">${safeCompanyName}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Category:</td>
                <td style="padding: 6px 0; color: #0f172a;">${safeCategory}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Work Mode:</td>
                <td style="padding: 6px 0; color: #0f172a;">${safeWorkMode}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Open Positions:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: 700;">${Number(vacancies || 1)} Seats</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Locations:</td>
                <td style="padding: 6px 0; color: #0f172a;">${safeLocation}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Min. Education:</td>
                <td style="padding: 6px 0; color: #0f172a;">${safeQualification}</td>
              </tr>
              <tr style="border-top: 1px solid #f8fafc;">
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Posted By:</td>
                <td style="padding: 6px 0; color: #64748b; font-size: 12px;">${safePostedBy}</td>
              </tr>
            </table>

            <div style="margin: 28px 0 16px 0; text-align: center;">
              <a href="${adminJobsLink}" 
                 style="background: #f59e0b; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.25);">
                Click to Review on Admin Panel →
              </a>
            </div>
          </div>
        </div>
      `;

      mailOptions = {
        from: `"ZenSolve Admin Alerts" <${emailUser}>`,
        to: adminEmail,
        subject,
        html: htmlContent,
      };

    // 4. Newsletter Subscription -> Welcome Email (S03: Rate-limited, validated)
    } else if (type === 'NEWSLETTER_WELCOME') {
      const { email: rawEmail } = payload || {};
      if (!rawEmail || typeof rawEmail !== 'string') {
        return res.status(400).json({ error: 'Subscriber email is required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = rawEmail.trim().toLowerCase();
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Invalid subscriber email address.' });
      }

      // Strict Rate limiting for public newsletter welcome: 5 per hour per email
      const subRateCheck = checkRateLimit(`newsletter_${normalizedEmail}`, 5, 3600000);
      if (!subRateCheck.allowed) {
        return res.status(429).json({ error: 'Newsletter welcome email already sent recently.' });
      }

      const safeSubscriberEmail = escapeHtml(normalizedEmail);
      const subject = `🎉 Welcome to ZenSolve Career Newsletter!`;
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #6366f1;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">ZenSolve Careers</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Official Newsletter Subscription</p>
          </div>

          <div style="padding: 24px; text-align: center;">
            <h2 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 10px 0;">
              Thank You for Subscribing! 🚀
            </h2>
            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
              You have successfully subscribed to the ZenSolve Career Newsletter (${safeSubscriberEmail}). You will receive job digests, verified employer openings, walk-in interview notices, and hiring opportunities across top companies in India.
            </p>

            <div style="margin: 24px 0;">
              <a href="https://infozensolve.in/jobs" 
                 style="background: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                Explore Verified Job Openings Now →
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            ZenSolve Infotech Solution Private Limited • Jamshedpur, Jharkhand.
          </div>
        </div>
      `;

      mailOptions = {
        from: `"ZenSolve Careers" <${emailUser}>`,
        to: normalizedEmail,
        bcc: adminEmail,
        subject,
        html: htmlContent,
      };

    } else {
      return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: `Email notification sent successfully for ${type}.`,
    });
  } catch (error) {
    console.error('Error in send-email API handler:', error);
    return res.status(500).json({
      error: 'Failed to send email notification.',
      details: error.message,
    });
  }
}
