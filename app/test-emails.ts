import { Resend } from 'resend';

// Hardcode API key for quick test
const resend = new Resend('re_NuzuxkK1_LcPcCKMvRbTLrkAXFmK2zFVx');
// We MUST use onboarding@resend.dev if the user hasn't verified a custom domain on Resend
const FROM = 'onboarding@resend.dev';
const TO = 'sameetpisal@gmail.com';

async function sendDemoEmails() {
  console.log('Sending Weekly Report Email...');
  try {
    const data1 = await resend.emails.send({
      from: FROM,
      to: TO,
      subject: '📊 Your Weekly Trading Report is Ready',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fafafa;padding:32px;border-radius:12px;">
          <h1 style="color:#3b82f6;font-size:24px;margin-bottom:8px;">Weekly Trading Report</h1>
          <p style="color:#a1a1aa;margin-bottom:24px;">Here is your automated weekly performance summary.</p>
          <div style="background:#171717;border:1px solid #262626;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:14px;line-height:1.6;">
            <strong>Win Rate:</strong> 68%
            <strong>Total PnL:</strong> +$1,450.50
            <strong>Profit Factor:</strong> 2.4
            
            <strong>AI Analysis:</strong>
            You executed your trend-following strategy flawlessly this week. Your patience in waiting for the 15m pullback setups paid off significantly.
            However, your two losses on Friday were taken outside of your normal trading window. Avoid forcing setups when volume is low.
          </div>
          <p style="color:#a1a1aa;margin-top:24px;font-size:12px;">Log in to your TradeVault to view charts and full analytics.</p>
        </div>
      `,
    });
    console.log('Weekly Report sent successfully!', data1);
  } catch (error) {
    console.error('Failed to send Weekly Report:', error);
  }

  console.log('\nSending Drawdown Warning Email...');
  try {
    const data2 = await resend.emails.send({
      from: FROM,
      to: TO,
      subject: '⚠️ Drawdown Warning — Action Required',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fafafa;padding:32px;border-radius:12px;">
          <h1 style="color:#ef4444;font-size:24px;margin-bottom:8px;">⚠️ Drawdown Warning</h1>
          <p style="color:#a1a1aa;margin-bottom:24px;">Your account <strong style="color:#fafafa">Apex 50k - Account 1</strong> has reached a critical drawdown level.</p>
          <div style="background:#171717;border:1px solid #ef444440;border-radius:8px;padding:20px;">
            <p>Current Drawdown: <strong style="color:#ef4444">4.20%</strong></p>
            <p>Maximum Allowed: <strong style="color:#f59e0b">5.00%</strong></p>
          </div>
          <p style="color:#a1a1aa;margin-top:24px;font-size:12px;">Review your recent trades and consider stopping for the day to protect your capital.</p>
        </div>
      `,
    });
    console.log('Drawdown Warning sent successfully!', data2);
  } catch (error) {
    console.error('Failed to send Drawdown Warning:', error);
  }
}

sendDemoEmails();
