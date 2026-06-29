import { Suspense } from 'react';
import { getDashboardStatsAction } from '@/actions/trade.actions';
import { getEquityCurveAction, getMonthlyReturnsAction } from '@/actions/analytics.actions';
import { getAccountsAction } from '@/actions/account.actions';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  TrendingUp, Target, Activity, DollarSign,
  BarChart2, AlertTriangle, Zap, Plus
} from 'lucide-react';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { MistakeCostWidget } from '@/components/dashboard/MistakeCostWidget';
import { EdgeDiscoveryWidget } from '@/components/dashboard/EdgeDiscoveryWidget';
import { PropFirmTrackerWidget } from '@/components/dashboard/PropFirmTrackerWidget';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { getTradesAction } from '@/actions/trade.actions';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your trading performance overview',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, accounts, equityCurve, monthlyReturns, recentTrades] = await Promise.all([
    getDashboardStatsAction(),
    getAccountsAction(),
    getEquityCurveAction(),
    getMonthlyReturnsAction(),
    getTradesAction({ limit: 8 }),
  ]);

  const hasNoData = stats.totalTrades === 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Your trading performance at a glance"
        actions={
          <Link href="/trades/new" id="btn-dashboard-add-trade" className="btn-add">
            <Plus size={14} />
            Add Trade
          </Link>
        }
      />

      {/* Account selector hint */}
      {accounts.length === 0 && (
        <div className="setup-banner">
          <div className="setup-banner-icon"><Zap size={16} color="#f59e0b" /></div>
          <div>
            <strong>Get started:</strong>{' '}
            <Link href="/accounts" style={{ color: '#3b82f6' }}>Create a trading account</Link>{' '}
            and{' '}
            <Link href="/strategies" style={{ color: '#3b82f6' }}>build your first strategy</Link>{' '}
            to unlock full analytics.
          </div>
        </div>
      )}

      {/* Prop Firm Tracker */}
      <div className="mb-6">
        <PropFirmTrackerWidget />
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <div className="stats-grid">
          <StatCard
            id="stat-total-trades"
            label="Total Trades"
            value={stats.totalTrades}
            format="number"
            icon={<Activity size={14} />}
          />
          <StatCard
            id="stat-win-rate"
            label="Win Rate"
            value={stats.winRate}
            format="percent"
            icon={<Target size={14} />}
          />
          <StatCard
            id="stat-profit-factor"
            label="Profit Factor"
            value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
            format="raw"
            icon={<BarChart2 size={14} />}
          />
          <StatCard
            id="stat-net-profit"
            label="Net Profit"
            value={stats.netProfit}
            format="currency"
            icon={<DollarSign size={14} />}
          />
          <StatCard
            id="stat-avg-rr"
            label="Avg Risk:Reward"
            value={stats.averageRR.toFixed(2)}
            format="raw"
            suffix="R"
            icon={<TrendingUp size={14} />}
          />
          <StatCard
            id="stat-largest-win"
            label="Largest Win"
            value={stats.largestWin}
            format="currency"
            positive={true}
            icon={<TrendingUp size={14} />}
          />
          <StatCard
            id="stat-largest-loss"
            label="Largest Loss"
            value={stats.largestLoss}
            format="currency"
            icon={<AlertTriangle size={14} />}
          />
          <StatCard
            id="stat-monthly-pnl"
            label="This Month"
            value={stats.monthlyPnl}
            format="currency"
            icon={<DollarSign size={14} />}
          />
        </div>
      </Suspense>

      {/* Charts */}
      {!hasNoData && (
        <DashboardCharts
          equityCurve={equityCurve}
          monthlyReturns={monthlyReturns}
        />
      )}

      {/* Advanced Engines */}
      <div className="advanced-engines-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <MistakeCostWidget />
        <EdgeDiscoveryWidget />
      </div>

      {/* Recent Trades */}
      <RecentTrades trades={recentTrades.trades} />


    </div>
  );
}

function StatsGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
      {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}
