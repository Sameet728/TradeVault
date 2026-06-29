'use client';

import type { TradingAccount } from '@/types/ai.types';
import type { Trade } from '@/types/trade.types';
import { EmptyState } from '@/components/shared/EmptyState';
import { Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import Link from 'next/link';

interface PropTrackerClientProps {
  accounts: TradingAccount[];
  trades: Trade[];
}

export function PropTrackerClient({ accounts, trades }: PropTrackerClientProps) {
  if (accounts.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<Target size={20} />}
          title="No prop firm accounts"
          description="Create a Prop Firm account in the Accounts section to start tracking your challenge progress."
          action={
            <Link href="/accounts" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
              Go to Accounts →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="tracker-layout">
      {accounts.map((account) => {
        const props = account.propFirmSettings!;
        const accountTrades = trades.filter((t) => t.accountId === account._id);

        const today = new Date().toISOString().split('T')[0];
        const todayTrades = accountTrades.filter((t) => t.tradeDate?.startsWith(today));
        const todayPnL = todayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

        const startBalance = props.startingBalance;
        const closedTrades = accountTrades.filter(t => t.status === 'closed');
        const trueTotalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
        const currentBalance = startBalance + trueTotalPnL;
        const profitPercent = ((currentBalance - startBalance) / startBalance) * 100;
        const profitTargetPercent = props.profitTarget;
        const progressToTarget = Math.min(100, Math.max(0, (profitPercent / profitTargetPercent) * 100));

        const dailyDDUsed = startBalance > 0 ? Math.abs(Math.min(0, todayPnL) / startBalance * 100) : 0;
        const maxDDUsed = startBalance > 0 ? ((startBalance - currentBalance) / startBalance * 100) : 0;

        const dailyDDRemaining = Math.max(0, props.dailyDrawdownLimit - dailyDDUsed);
        const maxDDRemaining = Math.max(0, props.maxDrawdownLimit - Math.max(0, maxDDUsed));

        const dailyDDRisk = dailyDDUsed / props.dailyDrawdownLimit;
        const maxDDRisk = maxDDUsed > 0 ? maxDDUsed / props.maxDrawdownLimit : 0;

        const statusColor = maxDDRisk >= 0.9 ? '#ef4444' : maxDDRisk >= 0.7 ? '#f59e0b' : '#22c55e';

        return (
          <div key={account._id} className="account-tracker card">
            {/* Header */}
            <div className="tracker-header">
              <div className="tracker-title-group">
                <div className="tracker-status" style={{ background: statusColor }} />
                <div>
                  <h3 className="tracker-name">{account.accountName}</h3>
                  <span className="tracker-meta">{account.broker} · {account.platform}</span>
                </div>
              </div>
              <div className="balance-display">
                <span className="balance-label">Balance</span>
                <span className="balance-value">{formatCurrency(currentBalance, account.currency)}</span>
                <span className="balance-change" style={{ color: profitPercent >= 0 ? '#22c55e' : '#ef4444' }}>
                  {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Progress to Target */}
            <div className="metric-card">
              <div className="metric-header">
                <TrendingUp size={14} color="#22c55e" />
                <span className="metric-label">Profit Target Progress</span>
                <span className="metric-value" style={{ color: '#22c55e' }}>
                  {profitPercent.toFixed(2)}% / {profitTargetPercent}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill profit"
                  style={{ width: `${progressToTarget}%` }}
                />
              </div>
              <div className="metric-footer">
                <span>{progressToTarget.toFixed(0)}% to target</span>
                <span>{formatCurrency(currentBalance - startBalance, account.currency, true)} gained</span>
              </div>
            </div>

            {/* Daily Drawdown */}
            <div className="metric-card">
              <div className="metric-header">
                <AlertTriangle size={14} color={dailyDDRisk >= 0.7 ? '#ef4444' : '#f59e0b'} />
                <span className="metric-label">Daily Drawdown</span>
                <span className="metric-value" style={{ color: dailyDDRisk >= 0.7 ? '#ef4444' : '#f59e0b' }}>
                  {dailyDDUsed.toFixed(2)}% / {props.dailyDrawdownLimit}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill dd"
                  style={{ width: `${Math.min(100, dailyDDRisk * 100)}%`, background: dailyDDRisk >= 0.7 ? '#ef4444' : '#f59e0b' }}
                />
              </div>
              <div className="metric-footer">
                <span className="danger-text" style={{ color: dailyDDRisk >= 0.7 ? '#ef4444' : '#71717a' }}>
                  {formatPercent(dailyDDRemaining)} remaining today
                </span>
                <span style={{ color: '#71717a' }}>Today: {formatCurrency(todayPnL, account.currency, true)}</span>
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="metric-card">
              <div className="metric-header">
                <TrendingDown size={14} color={maxDDRisk >= 0.8 ? '#ef4444' : '#71717a'} />
                <span className="metric-label">Max Drawdown</span>
                <span className="metric-value" style={{ color: maxDDRisk >= 0.8 ? '#ef4444' : 'var(--color-muted-foreground)' }}>
                  {Math.max(0, maxDDUsed).toFixed(2)}% / {props.maxDrawdownLimit}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill dd"
                  style={{ width: `${Math.min(100, Math.max(0, maxDDRisk) * 100)}%`, background: maxDDRisk >= 0.8 ? '#ef4444' : 'var(--color-placeholder)' }}
                />
              </div>
              <div className="metric-footer">
                <span>{formatPercent(maxDDRemaining)} max drawdown remaining</span>
                <span style={{ color: '#71717a' }}>{accountTrades.length} total trades</span>
              </div>
            </div>

            {/* Warnings */}
            {dailyDDRisk >= 0.8 && (
              <div className="warning-banner">
                <AlertTriangle size={14} />
                <span>⚠️ You are close to your daily drawdown limit. Consider stopping trading today.</span>
              </div>
            )}
            {maxDDRisk >= 0.85 && (
              <div className="warning-banner danger">
                <AlertTriangle size={14} />
                <span>🚨 CRITICAL: You are near the max drawdown limit. This challenge may be at risk.</span>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .tracker-layout { display: flex; flex-direction: column; gap: 20px; }
        .account-tracker { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .tracker-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .tracker-title-group { display: flex; align-items: flex-start; gap: 12px; }
        .tracker-status { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
        .tracker-name { font-size: 1.125rem; font-weight: 700; color: var(--color-foreground); margin: 0 0 2px; }
        .tracker-meta { font-size: 0.8125rem; color: #71717a; }
        .balance-display { text-align: right; }
        .balance-label { display: block; font-size: 0.75rem; color: #71717a; }
        .balance-value { display: block; font-size: 1.375rem; font-weight: 700; color: var(--color-foreground); letter-spacing: -0.02em; }
        .balance-change { font-size: 0.875rem; font-weight: 600; }
        .metric-card { padding: 14px 16px; background: rgba(255,255,255,0.02); border: 1px solid #1e1e1e; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
        .metric-header { display: flex; align-items: center; gap: 8px; }
        .metric-label { flex: 1; font-size: 0.8125rem; color: var(--color-muted-foreground); font-weight: 500; }
        .metric-value { font-size: 0.875rem; font-weight: 700; }
        .progress-bar { height: 6px; background: var(--color-border-subtle); border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        .progress-fill.profit { background: #22c55e; }
        .progress-fill.dd {}
        .metric-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #71717a; }
        .warning-banner {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 14px; border-radius: 8px;
          background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2);
          font-size: 0.875rem; color: #f59e0b;
        }
        .warning-banner.danger { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); color: #ef4444; }
      `}</style>
    </div>
  );
}
