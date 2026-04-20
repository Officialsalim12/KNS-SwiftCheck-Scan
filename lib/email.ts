/**
 * Email utility functions for sending notifications
 * Uses Resend API for email delivery
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Email sending disabled.');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'KNS Training <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send check-in confirmation email
 */
export async function sendCheckInEmail(participantName: string, participantEmail: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Check-In Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(to bottom, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">KNS Training</h1>
            </div>
          </div>
          
          <h2 style="color: #1e40af; margin-top: 0; font-size: 24px;">Thank you, ${participantName}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You have successfully checked in for today's session.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>Have a wonderful session!</strong>
          </p>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Reminder:</strong> Please remember to check out when you leave.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Knowledge Network Solutions</p>
            <p style="margin: 5px 0 0 0;">Training Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: participantEmail,
    subject: 'Check-In Confirmation - KNS Training',
    html,
  });
}

/**
 * Send check-out confirmation email
 */
export async function sendCheckOutEmail(participantName: string, participantEmail: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Check-Out Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(to bottom, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">KNS Training</h1>
            </div>
          </div>
          
          <h2 style="color: #1e40af; margin-top: 0; font-size: 24px;">Check-Out Successful, ${participantName}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You have successfully checked out from today's session.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>See you for tomorrow's session!</strong>
          </p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #15803d;">
              <strong>Thank you for attending!</strong> We look forward to seeing you again.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Knowledge Network Solutions</p>
            <p style="margin: 5px 0 0 0;">Training Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: participantEmail,
    subject: 'Check-Out Confirmation - KNS Training',
    html,
  });
}

