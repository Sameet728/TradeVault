'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { User, Lock, Key, Code2, Copy, Check } from 'lucide-react';
import { DummyModeToggle } from './DummyModeToggle';

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [copied, setCopied] = useState(false);

  // Simulate MT5 API key (in real app, generate and store this)
  const mt5ApiKey = `tj_${Buffer.from(user.email).toString('base64').slice(0, 24)}`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      // Update profile action would go here
      toast.success('Profile updated!');
    });
  }

  function copyApiKey() {
    navigator.clipboard.writeText(mt5ApiKey);
    setCopied(true);
    toast.success('API key copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="settings-layout">
      {/* Profile */}
      <div className="settings-section card">
        <div className="section-icon-header">
          <User size={16} color="#3b82f6" />
          <h3 className="section-title">Profile</h3>
        </div>
        <form onSubmit={handleSave} className="settings-form">
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Name</label>
              <input
                id="input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="form-input disabled"
              />
            </div>
          </div>
          <div className="field-meta">
            Member since {formatDate(user.createdAt, 'MMMM yyyy')}
          </div>
          <div className="form-footer">
            <button id="btn-save-profile" type="submit" className="btn-save" disabled={isPending}>
              {isPending ? <span className="spinner" /> : null}
              Save Profile
            </button>
          </div>
        </form>
      </div>
      
      {/* Dummy Mode */}
      <DummyModeToggle />

      {/* MT5 Integration */}
      <div className="settings-section card">
        <div className="section-icon-header">
          <Code2 size={16} color="#3b82f6" />
          <h3 className="section-title">MT5 Integration</h3>
        </div>
        <p className="section-desc">
          Use your API key with the TradeVault MT5 Expert Advisor (EA) to automatically
          sync trades directly from MetaTrader 5 to your journal.
        </p>

        <div className="api-key-box">
          <div className="api-key-label">Your API Key</div>
          <div className="api-key-value">
            <code className="api-key-code">{mt5ApiKey}</code>
            <button className="copy-btn" onClick={copyApiKey} id="btn-copy-api-key" title="Copy API key">
              {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="mt5-steps">
          <h4 className="steps-title">Setup Instructions</h4>
          <ol className="steps-list">
            <li>Download the TradeVault EA from the <span style={{ color: '#3b82f6' }}>MQL5 Market</span> (free)</li>
            <li>Open MetaTrader 5 and attach the EA to any chart</li>
            <li>Paste your API key in the EA settings</li>
            <li>Set the Journal URL to: <code className="inline-code">https://your-app.vercel.app</code></li>
            <li>Trades will sync automatically within 30 seconds of closing</li>
          </ol>
        </div>

        <div className="mt5-endpoint">
          <div className="endpoint-label">Sync Endpoint</div>
          <code className="endpoint-value">POST /api/mt5/sync</code>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section card danger-card">
        <div className="section-icon-header">
          <Lock size={16} color="#ef4444" />
          <h3 className="section-title" style={{ color: 'var(--color-foreground)' }}>Danger Zone</h3>
        </div>
        <div className="danger-actions">
          <div className="danger-action">
            <div>
              <div className="danger-label">Delete All Trades</div>
              <div className="danger-desc">Permanently remove all trade data. This cannot be undone.</div>
            </div>
            <button
              className="btn-danger"
              onClick={() => toast.error('Contact support to delete all trades')}
              id="btn-delete-all-trades"
            >
              Delete All Trades
            </button>
          </div>
          <div className="danger-divider" />
          <div className="danger-action">
            <div>
              <div className="danger-label">Delete Account</div>
              <div className="danger-desc">Permanently delete your account and all associated data.</div>
            </div>
            <button
              className="btn-danger"
              onClick={() => toast.error('Contact support to delete your account')}
              id="btn-delete-account"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-layout { display: flex; flex-direction: column; gap: 20px; max-width: 700px; }
        .settings-section { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .section-icon-header { display: flex; align-items: center; gap: 8px; }
        .section-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .section-desc { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.5; margin: 0; }
        .settings-form { display: flex; flex-direction: column; gap: 14px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.8125rem; font-weight: 500; color: var(--color-muted-foreground); }
        .form-input { padding: 8px 12px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-foreground); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color 0.15s; width: 100%; }
        .form-input:focus { border-color: #3b82f6; }
        .form-input.disabled { opacity: 0.5; cursor: not-allowed; }
        .field-meta { font-size: 0.8125rem; color: var(--color-placeholder); }
        .form-footer { display: flex; justify-content: flex-end; }
        .btn-save { padding: 8px 18px; background: #3b82f6; border: none; border-radius: 8px; color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 6px; font-family: inherit; }
        .btn-save:hover { background: #2563eb; }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .api-key-box { background: var(--color-background); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; }
        .api-key-label { font-size: 0.75rem; color: #71717a; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .api-key-value { display: flex; align-items: center; gap: 10px; }
        .api-key-code { font-family: monospace; font-size: 0.875rem; color: #3b82f6; word-break: break-all; flex: 1; }
        .copy-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: var(--color-border-subtle); border: 1px solid var(--color-border); color: var(--color-muted-foreground); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .copy-btn:hover { color: var(--color-foreground); border-color: #3f3f46; }
        .steps-title { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); margin: 0 0 8px; }
        .steps-list { padding: 0 0 0 18px; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        .steps-list li { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.4; }
        .mt5-endpoint { background: var(--color-background); border: 1px solid var(--color-border-subtle); border-radius: 8px; padding: 10px 14px; }
        .endpoint-label { font-size: 0.6875rem; color: var(--color-placeholder); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .endpoint-value { font-family: monospace; font-size: 0.875rem; color: var(--color-muted-foreground); }
        .inline-code { font-family: monospace; font-size: 0.875rem; color: var(--color-muted-foreground); background: var(--color-border-subtle); padding: 1px 4px; border-radius: 3px; }
        .mt5-steps {}
        .danger-card { border-color: rgba(239,68,68,0.15) !important; }
        .danger-actions { display: flex; flex-direction: column; gap: 16px; }
        .danger-action { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .danger-label { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); margin-bottom: 2px; }
        .danger-desc { font-size: 0.8125rem; color: #71717a; }
        .danger-divider { height: 1px; background: var(--color-border-subtle); }
        .btn-danger { padding: 7px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #ef4444; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
        .btn-danger:hover { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.35); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
