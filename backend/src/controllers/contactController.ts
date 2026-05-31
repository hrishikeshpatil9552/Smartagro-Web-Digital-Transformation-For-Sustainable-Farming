import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import Contact from '../models/Contact';

export const submitContact = async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Name, email, subject and message are required' });
  }

  // 1. Save to MongoDB first (always)
  try {
    await Contact.create({ name, email, phone, subject, message });
    console.log('✅ Contact saved to DB:', name, email);
  } catch (dbError: any) {
    console.error('❌ DB save failed:', dbError.message);
    return res.status(500).json({ message: 'Failed to save message. Please try again.' });
  }

  // 2. Send email
  try {
    const user = process.env.CONTACT_EMAIL_USER;
    const pass = process.env.CONTACT_EMAIL_PASS;

    console.log('📧 Email config — user:', user, '| pass set:', !!pass && pass !== 'your_gmail_app_password_here');

    if (!user || !pass || pass === 'your_gmail_app_password_here') {
      console.warn('⚠️ Email credentials not configured. Skipping email send.');
      return res.status(200).json({ message: 'Message received successfully!' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.verify();
    console.log('✅ SMTP connection verified');

    await transporter.sendMail({
      from: `"AgriSarthi Contact" <${user}>`,
      to: 'agroweb308@gmail.com',
      replyTo: email,
      subject: `[AgriSarthi] ${subject} — from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#16a34a;padding:20px;">
            <h2 style="color:white;margin:0;">🌾 New Contact — AgriSarthi</h2>
          </div>
          <div style="padding:24px;background:#f9fafb;">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:12px 8px;font-weight:bold;color:#374151;width:130px;">Full Name</td>
                <td style="padding:12px 8px;color:#111827;">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:12px 8px;font-weight:bold;color:#374151;">Email</td>
                <td style="padding:12px 8px;"><a href="mailto:${email}" style="color:#16a34a;">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:12px 8px;font-weight:bold;color:#374151;">Phone</td>
                <td style="padding:12px 8px;color:#111827;">${phone || 'Not provided'}</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:12px 8px;font-weight:bold;color:#374151;">Subject</td>
                <td style="padding:12px 8px;color:#111827;">${subject}</td>
              </tr>
              <tr>
                <td style="padding:12px 8px;font-weight:bold;color:#374151;vertical-align:top;">Message</td>
                <td style="padding:12px 8px;color:#111827;white-space:pre-wrap;">${message}</td>
              </tr>
            </table>
          </div>
          <div style="padding:12px 24px;background:#f3f4f6;text-align:center;">
            <p style="color:#6b7280;font-size:12px;margin:0;">
              Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent to agroweb308@gmail.com');
    return res.status(200).json({ message: 'Message sent successfully!' });

  } catch (emailError: any) {
    console.error('❌ Email send failed:', emailError.message);
    // DB already saved — still return success to user
    return res.status(200).json({ message: 'Message received! We will get back to you soon.' });
  }
};
