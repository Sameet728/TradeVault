import { PageHeader } from '@/components/shared/PageHeader';
import { ReportsClient } from '@/components/reports/ReportsClient';
import { getDashboardStatsAction } from '@/actions/trade.actions';
import { getEquityCurveAction, getMonthlyReturnsAction, getStrategyStatsAction } from '@/actions/analytics.actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Generate and export PDF trading reports',
};

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [stats, equityCurve, monthlyReturns, strategyStats] = await Promise.all([
    getDashboardStatsAction(),
    getEquityCurveAction(),
    getMonthlyReturnsAction(),
    getStrategyStatsAction(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Generate professional PDF reports of your trading performance"
      />
      <ReportsClient
        stats={stats}
        equityCurve={equityCurve}
        monthlyReturns={monthlyReturns}
        strategyStats={strategyStats}
      />
    </div>
  );
}
