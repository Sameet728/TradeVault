import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@tradingjournal.app';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  await resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendWeeklyReportEmail(
  to: string,
  summary: string
): Promise<void> {
  await sendEmail({
    to,
    subject: '📊 Your Weekly Trading Report is Ready',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fafafa;padding:32px;border-radius:12px;">
        <h1 style="color:#3b82f6;font-size:24px;margin-bottom:8px;">Weekly Trading Report</h1>
        <p style="color:#a1a1aa;margin-bottom:24px;">Here is your automated weekly performance summary.</p>
        <div style="background:#171717;border:1px solid #262626;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:14px;line-height:1.6;">
          ${summary}
        </div>
        <p style="color:#a1a1aa;margin-top:24px;font-size:12px;">Log in to your TradeVault to view charts and full analytics.</p>
      </div>
    `,
  });
}

export async function sendDrawdownWarningEmail(
  to: string,
  accountName: string,
  currentDrawdown: number,
  maxAllowed: number
): Promise<void> {
  await sendEmail({
    to,
    subject: '⚠️ Drawdown Warning — Action Required',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fafafa;padding:32px;border-radius:12px;">
        <h1 style="color:#ef4444;font-size:24px;margin-bottom:8px;">⚠️ Drawdown Warning</h1>
        <p style="color:#a1a1aa;margin-bottom:24px;">Your account <strong style="color:#fafafa">${accountName}</strong> has reached a critical drawdown level.</p>
        <div style="background:#171717;border:1px solid #ef444440;border-radius:8px;padding:20px;">
          <p>Current Drawdown: <strong style="color:#ef4444">${currentDrawdown.toFixed(2)}%</strong></p>
          <p>Maximum Allowed: <strong style="color:#f59e0b">${maxAllowed.toFixed(2)}%</strong></p>
        </div>
        <p style="color:#a1a1aa;margin-top:24px;font-size:12px;">Review your recent trades and consider stopping for the day.</p>
      </div>
    `,
  });
}
