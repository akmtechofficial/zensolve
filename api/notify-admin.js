import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      companyName,
      hrName,
      email,
      phone,
      companyType,
      industry,
      location,
      website,
      uid,
      isReminder,
      reminderCount,
    } = req.body || {};

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

    const isUrgent = Boolean(isReminder);
    const countNumber = reminderCount || 1;

    const subject = isUrgent
      ? `⚡ [URGENT REMINDER ${countNumber}/3] Company Approval Request: ${companyName || 'Unknown Company'}`
      : `🚨 New Company Registration Pending Approval: ${companyName || 'Unknown Company'}`;

    const alertTitle = isUrgent
      ? `⚡ Faster Approval Requested (Reminder ${countNumber} of 3 Today)`
      : `🚨 Action Required: New Company Approval Pending`;

    const alertMessage = isUrgent
      ? `The employer "<strong>${companyName || 'Employer'}</strong>" has sent an expedited verification reminder. They are waiting to publish job vacancies on ZenSolve.`
      : `A new company has registered on ZenSolve and is awaiting your review. They cannot publish job vacancies until approved in the admin console.`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <!-- Header Banner -->
        <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid ${isUrgent ? '#f59e0b' : '#6366f1'};">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
            ZenSolve Admin Portal
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">
            ${isUrgent ? 'Expedited Verification Reminder Alert' : 'New Employer Registration Notification'}
          </p>
        </div>

        <!-- Alert Notification -->
        <div style="padding: 24px;">
          <div style="background: ${isUrgent ? '#fef3c7' : '#e0e7ff'}; border: 1px solid ${isUrgent ? '#fde68a' : '#c7d2fe'}; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; color: ${isUrgent ? '#92400e' : '#3730a3'}; font-size: 14px; font-weight: 700;">
              ${alertTitle}
            </p>
            <p style="margin: 6px 0 0 0; color: ${isUrgent ? '#b45309' : '#4338ca'}; font-size: 12px; line-height: 1.5;">
              ${alertMessage}
            </p>
          </div>

          <!-- Company Details Table -->
          <h2 style="font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            Company Information
          </h2>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Company Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${companyName || 'Not Provided'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">HR Representative:</td>
              <td style="padding: 8px 0; color: #0f172a;">${hrName || 'Not Provided'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Business Email:</td>
              <td style="padding: 8px 0; color: #2563eb; font-weight: 600;">
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email || 'Not Provided'}</a>
              </td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Contact Phone:</td>
              <td style="padding: 8px 0; color: #0f172a;">${phone || 'Not Provided'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Company Type:</td>
              <td style="padding: 8px 0; color: #0f172a;">${companyType || 'Private Limited'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Industry:</td>
              <td style="padding: 8px 0; color: #0f172a;">${industry || 'Not Specified'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location:</td>
              <td style="padding: 8px 0; color: #0f172a;">${location || 'India'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Website:</td>
              <td style="padding: 8px 0; color: #0f172a;">
                ${website ? `<a href="${website}" target="_blank" style="color: #4f46e5; text-decoration: underline;">${website}</a>` : 'None Provided'}
              </td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">User UID:</td>
              <td style="padding: 8px 0; color: #64748b; font-family: monospace; font-size: 11px;">${uid || 'N/A'}</td>
            </tr>
            <tr style="border-top: 1px solid #f8fafc;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Timestamp:</td>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px;">${formattedTime}</td>
            </tr>
          </table>

          <!-- Action CTA Button -->
          <div style="margin: 28px 0 16px 0; text-align: center;">
            <a href="https://infozensolve.in/admin/companies" 
               style="background: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Open Admin Console to Approve Company
            </a>
          </div>

          <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">
            Direct URL: https://infozensolve.in/admin/companies
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
          Automated dispatch by ZenSolve Infotech Solution Private Limited.
        </div>
      </div>
    `;

    const textContent = `
ZenSolve Admin Alert: ${subject}

${isUrgent ? 'URGENT: Employer has requested faster approval.' : 'A new company has registered on ZenSolve and is awaiting verification.'}

Company Details:
- Company Name: ${companyName || 'Not Provided'}
- HR Representative: ${hrName || 'Not Provided'}
- Business Email: ${email || 'Not Provided'}
- Phone: ${phone || 'Not Provided'}
- Company Type: ${companyType || 'Private Limited'}
- Industry: ${industry || 'Not Specified'}
- Location: ${location || 'India'}
- Website: ${website || 'None'}
- Timestamp: ${formattedTime}
- User UID: ${uid || 'N/A'}

To review and approve this company, please open your admin console:
https://infozensolve.in/admin/companies
    `;

    const mailOptions = {
      from: `"ZenSolve Platform" <${emailUser}>`,
      to: adminEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: isUrgent ? 'Expedited reminder email sent to ZenSolve admin.' : 'Admin notification email sent successfully.',
    });
  } catch (error) {
    console.error('Error dispatching admin notification email:', error);
    return res.status(500).json({
      error: 'Failed to send admin notification email.',
      details: error.message,
    });
  }
}
