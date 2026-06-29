'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAccountAction, deleteAccountAction } from '@/actions/account.actions';
import type { TradingAccount } from '@/types/ai.types';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Wallet, Trash2, Target, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const BROKERS = [
  'FTMO', 'Blue Guardian', 'Goat Funded', 'FundedNext', 'MyForexFunds',
  'The5ers', 'Fidelcrest', 'E8 Funding', 'Apex Trader Funding',
  'Interactive Brokers', 'Pepperstone', 'IC Markets', 'XM', 'Exness', 'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CHF', 'JPY', 'CAD'];
const PLATFORMS = ['MT5', 'MT4', 'cTrader', 'MatchTrader', 'Other'];

interface AccountsClientProps {
  accounts: TradingAccount[];
}

export function AccountsClient({ accounts }: AccountsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const [accountName, setAccountName] = useState('');
  const [broker, setBroker] = useState(BROKERS[0]);
  const [customBroker, setCustomBroker] = useState('');
  const [platform, setPlatform] = useState<TradingAccount['platform']>('MT5');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [accountType, setAccountType] = useState<'personal' | 'prop'>('personal');
  const [accountNumber, setAccountNumber] = useState('');
  const [profitTarget, setProfitTarget] = useState('');
  const [dailyDD, setDailyDD] = useState('');
  const [maxDD, setMaxDD] = useState('');

  function resetForm() {
    setAccountName(''); setBroker(BROKERS[0]); setCustomBroker('');
    setPlatform('MT5'); setBalance(''); setCurrency('USD');
    setAccountType('personal'); setAccountNumber('');
    setProfitTarget(''); setDailyDD(''); setMaxDD('');
    setShowForm(false);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const finalBroker = broker === 'Other' ? customBroker : broker;
      const result = await createAccountAction({
        accountName,
        broker: finalBroker,
        platform,
        balance: parseFloat(balance) || 0,
        currency,
        type: accountType,
        accountNumber: accountNumber || undefined,
        isActive: true,
        propFirmSettings: accountType === 'prop' ? {
          profitTarget: parseFloat(profitTarget) || 10,
          dailyDrawdownLimit: parseFloat(dailyDD) || 5,
          maxDrawdownLimit: parseFloat(maxDD) || 10,
          startingBalance: parseFloat(balance) || 0,
        } : undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Account created!');
        resetForm();
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete account "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteAccountAction(id);
      if (result.error) toast.error(result.error);
      else { toast.success('Account deleted'); router.refresh(); }
    });
  }

  return (
    <div className="accounts-layout">
      {/* Account Grid */}
      <div className="accounts-main">
        {accounts.length === 0 && !showForm ? (
          <div className="card">
            <EmptyState
              icon={<Wallet size={20} />}
              title="No accounts yet"
              description="Create your first trading account to start logging trades."
              action={
                <button className="btn-primary-link" onClick={() => setShowForm(true)} id="btn-empty-create-account">
                  <Plus size={14} /> Create Account
                </button>
              }
            />
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => {
              const props = account.propFirmSettings;
              const currentProgress = props
                ? ((account.balance - props.startingBalance) / props.startingBalance) * 100
                : 0;
              const targetProgress = props ? (currentProgress / props.profitTarget) * 100 : 0;

              return (
                <div key={account._id} className="account-card card">
                  <div className="account-header">
                    <div className="account-icon">
                      {account.type === 'prop' ? <Target size={16} color="#3b82f6" /> : <Wallet size={16} color="#22c55e" />}
                    </div>
                    <div className="account-type-badge">
                      <span className={`badge ${account.type === 'prop' ? 'badge-accent' : 'badge-success'}`}>
                        {account.type === 'prop' ? 'Prop Firm' : 'Personal'}
                      </span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(account._id, account.accountName)}
                      disabled={isPending}
                      title="Delete account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="account-name">{account.accountName}</div>
                  <div className="account-broker">{account.broker} · {account.platform}</div>

                  <div className="account-balance">
                    <span className="balance-label">Balance</span>
                    <span className="balance-value">{formatCurrency(account.balance, account.currency)}</span>
                  </div>

                  {account.type === 'prop' && props && (
                    <div className="prop-tracker">
                      <div className="prop-stat">
                        <span className="prop-label">Target</span>
                        <span className="prop-value success">{props.profitTarget}%</span>
                      </div>
                      <div className="prop-stat">
                        <span className="prop-label">Current</span>
                        <span className={`prop-value ${currentProgress >= 0 ? 'success' : 'loss'}`}>
                          {currentProgress.toFixed(2)}%
                        </span>
                      </div>
                      <div className="prop-stat">
                        <span className="prop-label">Daily DD Limit</span>
                        <span className="prop-value warning">{props.dailyDrawdownLimit}%</span>
                      </div>
                      <div className="prop-stat">
                        <span className="prop-label">Max DD Limit</span>
                        <span className="prop-value warning">{props.maxDrawdownLimit}%</span>
                      </div>
                      <div className="progress-row">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min(100, Math.max(0, targetProgress))}%` }}
                          />
                        </div>
                        <span className="progress-text">{Math.min(100, Math.max(0, targetProgress)).toFixed(0)}% to target</span>
                      </div>
                    </div>
                  )}

                  {account.accountNumber && (
                    <div className="account-number">#{account.accountNumber}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Button */}
        {accounts.length > 0 && !showForm && (
          <button className="btn-create-float" onClick={() => setShowForm(true)} id="btn-create-account">
            <Plus size={14} /> New Account
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="create-form-wrap card animate-fade-in">
          <h3 className="form-title">New Trading Account</h3>
          <form onSubmit={handleCreate} className="create-form">
            <div className="form-row">
              <div className="field">
                <label className="field-label">Account Name *</label>
                <input id="input-account-name" type="text" placeholder="My FTMO Account" value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="form-input" />
              </div>
              <div className="field">
                <label className="field-label">Account Type</label>
                <div className="type-toggle">
                  <button type="button" className={`type-btn ${accountType === 'personal' ? 'active' : ''}`} onClick={() => setAccountType('personal')}>Personal</button>
                  <button type="button" className={`type-btn ${accountType === 'prop' ? 'active' : ''}`} onClick={() => setAccountType('prop')}>Prop Firm</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">Broker</label>
                <select value={broker} onChange={(e) => setBroker(e.target.value)} className="form-select" id="select-broker">
                  {BROKERS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {broker === 'Other' && (
                <div className="field">
                  <label className="field-label">Broker Name</label>
                  <input type="text" placeholder="Enter broker name" value={customBroker} onChange={(e) => setCustomBroker(e.target.value)} className="form-input" />
                </div>
              )}
              <div className="field">
                <label className="field-label">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value as TradingAccount['platform'])} className="form-select" id="select-platform">
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">Starting Balance</label>
                <input id="input-balance" type="number" step="any" placeholder="10000" value={balance} onChange={(e) => setBalance(e.target.value)} className="form-input" />
              </div>
              <div className="field">
                <label className="field-label">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select" id="select-currency">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Account Number</label>
                <input type="text" placeholder="Optional" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="form-input" />
              </div>
            </div>

            {accountType === 'prop' && (
              <div className="form-row">
                <div className="field">
                  <label className="field-label">Profit Target (%)</label>
                  <input type="number" step="any" placeholder="10" value={profitTarget} onChange={(e) => setProfitTarget(e.target.value)} className="form-input" />
                </div>
                <div className="field">
                  <label className="field-label">Daily DD Limit (%)</label>
                  <input type="number" step="any" placeholder="5" value={dailyDD} onChange={(e) => setDailyDD(e.target.value)} className="form-input" />
                </div>
                <div className="field">
                  <label className="field-label">Max DD Limit (%)</label>
                  <input type="number" step="any" placeholder="10" value={maxDD} onChange={(e) => setMaxDD(e.target.value)} className="form-input" />
                </div>
              </div>
            )}

            <div className="form-footer">
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              <button id="btn-save-account" type="submit" className="btn-save" disabled={isPending}>
                {isPending ? <span className="spinner" /> : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .accounts-layout { display: flex; flex-direction: column; gap: 24px; }
        .accounts-main { display: flex; flex-direction: column; gap: 16px; }
        .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .account-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .account-header { display: flex; align-items: center; gap: 10px; }
        .account-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--color-border-subtle); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; }
        .account-type-badge { margin-left: 4px; }
        .delete-btn { margin-left: auto; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: none; border: none; color: var(--color-placeholder); cursor: pointer; transition: all 0.15s; }
        .delete-btn:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .account-name { font-size: 1rem; font-weight: 600; color: var(--color-foreground); }
        .account-broker { font-size: 0.8125rem; color: #71717a; }
        .account-balance { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; }
        .balance-label { font-size: 0.75rem; color: #71717a; }
        .balance-value { font-size: 1.125rem; font-weight: 700; color: var(--color-foreground); letter-spacing: -0.02em; }
        .prop-tracker { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); }
        .prop-stat { display: flex; justify-content: space-between; }
        .prop-label { font-size: 0.75rem; color: #71717a; }
        .prop-value { font-size: 0.875rem; font-weight: 600; }
        .prop-value.success { color: #22c55e; }
        .prop-value.loss { color: #ef4444; }
        .prop-value.warning { color: #f59e0b; }
        .progress-row { display: flex; align-items: center; gap: 10px; }
        .progress-bar { flex: 1; height: 4px; background: var(--color-border-subtle); border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; background: #3b82f6; border-radius: 99px; transition: width 0.5s ease; }
        .progress-text { font-size: 0.6875rem; color: var(--color-placeholder); white-space: nowrap; }
        .account-number { font-size: 0.75rem; color: var(--color-placeholder); font-family: monospace; }
        .btn-create-float { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px; color: #3b82f6; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; align-self: flex-start; }
        .btn-create-float:hover { background: rgba(59,130,246,0.14); }
        .btn-primary-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #3b82f6; border-radius: 8px; color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s; border: none; font-family: inherit; }
        .btn-primary-link:hover { background: #2563eb; }
        .create-form-wrap { padding: 24px; }
        .form-title { font-size: 1rem; font-weight: 600; color: var(--color-foreground); margin: 0 0 20px; }
        .create-form { display: flex; flex-direction: column; gap: 12px; }
        .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.8125rem; font-weight: 500; color: var(--color-muted-foreground); }
        .form-input, .form-select { padding: 8px 12px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-foreground); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color 0.15s; width: 100%; }
        .form-input::placeholder { color: #3f3f46; }
        .form-input:focus, .form-select:focus { border-color: #3b82f6; }
        .type-toggle { display: flex; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
        .type-btn { flex: 1; padding: 8px; background: none; border: none; color: #71717a; font-size: 0.875rem; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .type-btn.active { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .form-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
        .btn-cancel { padding: 8px 16px; background: none; border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-muted-foreground); font-size: 0.875rem; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .btn-cancel:hover { border-color: #3f3f46; color: var(--color-foreground); }
        .btn-save { padding: 8px 18px; background: #3b82f6; border: none; border-radius: 8px; color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 8px; min-width: 130px; justify-content: center; font-family: inherit; }
        .btn-save:hover { background: #2563eb; }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.25s ease; }
      `}</style>
    </div>
  );
}
