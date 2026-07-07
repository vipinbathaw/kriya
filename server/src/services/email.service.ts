import { Resend } from 'resend';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!config.RESEND_API_KEY) return null;
  if (!client) client = new Resend(config.RESEND_API_KEY);
  return client;
}

export const emailService = {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const resend = getClient();
    if (!resend) {
      logger.warn('RESEND_API_KEY not configured — skipping verification email');
      return;
    }

    const verifyUrl = `${config.APP_URL}/verify-email?token=${token}`;

    try {
      await resend.emails.send({
        from: 'Kriya <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #0891b2; margin-bottom: 16px;">Welcome to Kriya</h1>
            <p style="color: #374151; line-height: 1.6;">Click the button below to verify your email address and get started.</p>
            <a href="${verifyUrl}"
               style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #0891b2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Verify email
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              Or paste this link in your browser: <br/>
              <a href="${verifyUrl}" style="color: #0891b2;">${verifyUrl}</a>
            </p>
          </div>
        `,
      });
      logger.info({ email }, 'Verification email sent');
    } catch (err) {
      logger.error({ err, email }, 'Failed to send verification email');
    }
  },
};
