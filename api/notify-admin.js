import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { adminDb, verifyAuthToken } from './_firebaseAdmin.js';
import { escapeHtml } from './_utils.js';
import { checkRateLimit } from './_rateLimiter.js';

dotenv.config();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // S15: Authenticate caller using Firebase ID Token
    let caller;
    try {
      caller = await verifyAuthToken(req);
    } catch (authErr) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required to trigger admin notifications.' });
    }

    const callerUid = caller.uid;

    const {
      companyName,
      hrName,
      email,
      phone,
      companyType,
      industry,
      clientCount,
      gstNumber,
      isManpowerAgency,
      location,
      website,
      isReminder,
    } = req.body || {};

    // S15: Server-side rate limiting for reminders (max 3 reminders per 24 hours per company)
    if (isReminder) {
      const reminderKey = `reminder_${callerUid}`;
      const reminderCheck = checkRateLimit(reminderKey, 3, 24 * 60 * 60 * 1000);
      if (!reminderCheck.allowed) {
        return res.status(429).json({
          error: 'Daily reminder limit reached (maximum 3 reminders per 24 hours). ZenSolve admins have been notified.',
        });
      }
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

    // S14: HTML escape all user-supplied variables
    const safeCompanyName = escapeHtml(companyName || 'Unknown Agency');
    const safeHrName = escapeHtml(hrName || 'Agency Lead');
    const safeEmail = escapeHtml(email || caller.email || 'Not Provided');
    const safePhone = escapeHtml(phone || 'Not Provided');
    const safeCompanyType = escapeHtml(companyType || 'Private Limited');
    const safeIndustry = escapeHtml(industry || 'Staffing & Manpower');
    const safeGstNumber = escapeHtml(gstNumber || '');
    const safeLocation = escapeHtml(location || 'India');
    const safeWebsite = escapeHtml(website || '');
    const safeClientCount = escapeHtml(clientCount || '1-5');

    const isUrgent = Boolean(isReminder);
    const subject = isUrgent
      ? `⚡ [EXPEDITED REVIEW REMINDER] Staffing Agency Approval: ${safeCompanyName}`
      : `🚨 New Staffing / Manpower Agency Pending Approval: ${safeCompanyName}`;

    const adminCompaniesLink = 'https://infozensolve.in/admin/companies';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid ${isUrgent ? '#f59e0b' : '#6366f1'};">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
            ZenSolve Admin Portal
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">
            ${isUrgent ? 'Expedited Verification Reminder Alert' : 'New Employer Registration Notification'}
          </p>
        </div>

        <div style="padding: 24px;">
          <div style="background: ${isUrgent ? '#fef3c7' : '#e0e7ff'}; border: 1px solid ${isUrgent ? '#fde68a' : '#c7d2fe'}; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; color: ${isUrgent ? '#92400e' : '#3730a3'}; font-size: 14px; font-weight: 700;">
              ${isUrgent ? 'Expedited Verification Reminder Sent' : 'New Manpower Agency Approval Pending'}
            </p>
            <p style="margin: 6px 0 0 0; color: ${isUrgent ? '#b45309' : '#4338ca'}; font-size: 12px; line-height: 1.5;">
              Agency <strong>${safeCompanyName}</strong> has registered and requires account verification before posting client vacancies.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 150px; font-weight: 600;">Agency Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${safeCompanyName}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Authorized Contact:</td>
              <td style="padding: 8px 0; color: #0f172a;">${safeHrName}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Contact Email:</td>
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
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">GSTIN / Reg No:</td>
              <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${safeGstNumber}</td>
            </tr>` : ''}
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Client Base:</td>
              <td style="padding: 8px 0; color: #0f172a;">${safeClientCount} Clients</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location:</td>
              <td style="padding: 8px 0; color: #0f172a;">${safeLocation}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Timestamp:</td>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px;">${formattedTime}</td>
            </tr>
          </table>

          <div style="margin: 28px 0 16px 0; text-align: center;">
            <a href="${adminCompaniesLink}" 
               style="background: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);">
              Click to Open Admin Console & Review →
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
          ZenSolve Automated Administration Alerts.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"ZenSolve Admin Alerts" <${emailUser}>`,
      to: adminEmail,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Admin notification dispatched successfully.',
    });
  } catch (error) {
    console.error('Error in notify-admin API handler:', error);
    return res.status(500).json({
      error: 'Failed to send admin notification.',
      details: error.message,
    });
  }
}
