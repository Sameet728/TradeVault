import {
  getEquityCurveAction,
  getDailyPnLAction,
  getMonthlyReturnsAction,
  getSessionStatsAction,
  getSymbolStatsAction,
  getStrategyStatsAction,
  getAdvancedStatsAction,
  getCalendarDataAction,
} from '@/actions/analytics.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { AnalyticsCharts } from '@/components/charts/AnalyticsCharts';
import { ParameterAnalytics } from '@/components/analytics/ParameterAnalytics';
import { TimeHeatmap } from '@/components/analytics/TimeHeatmap';
import { CalendarView } from '@/components/calendar/CalendarView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'In-depth trading performance analytics and insights',
};

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [equityCurve, dailyPnL, monthlyReturns, sessionStats, symbolStats, strategyStats, advancedStats, calendarData] = await Promise.all([
    getEquityCurveAction(),
    getDailyPnLAction(),
    getMonthlyReturnsAction(),
    getSessionStatsAction(),
    getSymbolStatsAction(),
    getStrategyStatsAction(),
    getAdvancedStatsAction(),
    getCalendarDataAction(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Deep dive into your trading performance across sessions, symbols, and strategies"
      />
      <AnalyticsCharts
        equityCurve={equityCurve}
        dailyPnL={dailyPnL}
        monthlyReturns={monthlyReturns}
        sessionStats={sessionStats}
        symbolStats={symbolStats}
        strategyStats={strategyStats}
        advancedStats={advancedStats}
        calendarData={calendarData}
      />
      {/* Strategy Engine - Parameter Analytics */}
      <div className="mt-6 mb-6">
        <ParameterAnalytics strategyId="" />
      </div>

      {/* Time & Session Heatmaps */}
      <div className="mt-6 mb-6">
        <TimeHeatmap />
      </div>

      {/* Calendar View */}
      <div className="mt-6 mb-6">
        <CalendarView />
      </div>
    </div>
  );
}
