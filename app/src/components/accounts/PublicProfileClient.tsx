'use client';

import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { Target, Activity, DollarSign, BarChart2 } from 'lucide-react';

interface PublicProfileClientProps {
  userEmail: string;
  netProfit: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  equityCurve: Array<{ date: string; balance: number; equity: number; drawdown: number; }>;
}

export function PublicProfileClient({
  userEmail,
  netProfit,
  winRate,
  profitFactor,
  totalTrades,
  equityCurve
}: PublicProfileClientProps) {
  const username = userEmail.split('@')[0] || 'Trader';
  const initial = userEmail.charAt(0).toUpperCase() || 'T';

  return (
    <div className="public-profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar">{initial}</div>
          <div>
            <h1>{username}'s Verified Track Record</h1>
            <span className="badge">TradeVault Verified</span>
          </div>
        </div>
      </div>

      <div className="stats-grid mt-6">
        <StatCard id="stat-pnl" label="Net Profit" value={netProfit} format="currency" icon={<DollarSign size={14} />} />
        <StatCard id="stat-winrate" label="Win Rate" value={winRate} format="percent" icon={<Target size={14} />} />
        <StatCard id="stat-pf" label="Profit Factor" value={profitFactor.toFixed(2)} format="raw" icon={<BarChart2 size={14} />} />
        <StatCard id="stat-trades" label="Total Trades" value={totalTrades} format="number" icon={<Activity size={14} />} />
      </div>

      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h3>Verified Equity Curve</h3>
          </div>
          <div className="card-body">
            {equityCurve.length > 0 ? (
              <DashboardCharts equityCurve={equityCurve} monthlyReturns={[]} />
            ) : (
              <div className="p-8 text-center text-zinc-500">Not enough data to generate equity curve.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .public-profile-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          color: var(--color-foreground);
          font-family: var(--font-sans);
        }
        .profile-header {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 24px; border-bottom: 1px solid var(--color-border);
        }
        .profile-info { display: flex; align-items: center; gap: 16px; }
        .avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--color-accent); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; font-weight: 700;
        }
        .profile-info h1 { margin: 0 0 6px 0; font-size: 1.5rem; letter-spacing: -0.02em; }
        .badge {
          background: rgba(34, 197, 94, 0.15); color: #22C55E;
          padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .mt-6 { margin-top: 24px; }
        .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
        .card-header { padding: 16px 20px; border-bottom: 1px solid var(--color-border-subtle); }
        .card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
        .card-body { padding: 20px; }
      `}</style>
    </div>
  );
}
