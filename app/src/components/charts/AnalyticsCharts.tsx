'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, ReferenceLine, PieChart, Pie, Cell,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import type {
  EquityPoint, DailyPnL, MonthlyReturn, SessionStat,  SymbolStat, StrategyStat, AdvancedMetrics, CalendarDay
} from '@/types/analytics.types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { BarChart2 } from 'lucide-react';
import { AdvancedMetricsCards } from './AdvancedMetricsCards';
import { MonthlyCalendar } from './MonthlyCalendar';

const TOOLTIP_STYLE = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--color-foreground)',
  fontSize: 13,
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

interface AnalyticsChartsProps {
  equityCurve: EquityPoint[];
  dailyPnL: DailyPnL[];
  monthlyReturns: MonthlyReturn[];
  sessionStats: SessionStat[];
  symbolStats: SymbolStat[];
  strategyStats: StrategyStat[];
  advancedStats: AdvancedMetrics | null;
  calendarData: CalendarDay[];
}

export function AnalyticsCharts({
  equityCurve, dailyPnL, monthlyReturns, sessionStats, symbolStats, strategyStats, advancedStats, calendarData
}: AnalyticsChartsProps) {
  const hasData = equityCurve.length > 0;

  if (!hasData) {
    return (
      <div className="card">
        <EmptyState
          icon={<BarChart2 size={20} />}
          title="No analytics data yet"
          description="Add closed trades to see your performance analytics, equity curve, and strategy insights."
        />
      </div>
    );
  }

  return (
    <div className="analytics-layout">
      {advancedStats && <AdvancedMetricsCards metrics={advancedStats} />}

      {/* Row 1: Equity + Drawdown */}
      <div className="chart-row">
        <div className="chart-card card large">
          <div className="chart-header">
            <h3 className="chart-title">Equity Curve</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, name: any) => [formatCurrency(v), name === 'balance' ? 'Balance' : 'Drawdown %']} />
              <Legend formatter={(v) => v === 'balance' ? 'Balance' : 'Drawdown %'} wrapperStyle={{ fontSize: 12, color: 'var(--color-muted-foreground)' }} />
              <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fill="url(#eq)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card card">
          <div className="chart-header">
            <h3 className="chart-title">Drawdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="dd2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={45} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v.toFixed(2)}%`, 'Drawdown']} />
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#dd2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Monthly + Daily */}
      <div className="chart-row">
        <div className="chart-card card">
          <div className="chart-header"><h3 className="chart-title">Monthly Returns</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [formatCurrency(v), 'PnL']} />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {monthlyReturns.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card card">
          <div className="chart-header"><h3 className="chart-title">Daily PnL</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyPnL.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-placeholder)', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [formatCurrency(v), 'PnL']} />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {dailyPnL.slice(-30).map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Sessions + Symbols */}
      <div className="chart-row">
        {sessionStats.length > 0 && (
          <div className="chart-card card">
            <div className="chart-header"><h3 className="chart-title">Session Performance</h3></div>
            <div className="session-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Trades</th>
                    <th>Win Rate</th>
                    <th>PF</th>
                    <th>Net PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionStats.map((s) => (
                    <tr key={s.session}>
                      <td style={{ fontWeight: 500 }}>{s.session}</td>
                      <td style={{ color: 'var(--color-muted-foreground)' }}>{s.trades}</td>
                      <td>
                        <span className={`badge ${s.winRate >= 50 ? 'badge-success' : 'badge-loss'}`}>
                          {s.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ color: s.profitFactor >= 1.5 ? '#22c55e' : 'var(--color-muted-foreground)' }}>
                        {s.profitFactor >= 999 ? '∞' : s.profitFactor.toFixed(2)}
                      </td>
                      <td>
                        <span style={{ color: s.netPnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                          {formatCurrency(s.netPnl, 'USD', true)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {symbolStats.length > 0 && (
          <div className="chart-card card">
            <div className="chart-header"><h3 className="chart-title">Symbol Breakdown</h3></div>
            <div className="symbol-pie-wrap">
              <PieChart width={180} height={180}>
                <Pie
                  data={symbolStats.slice(0, 7)}
                  cx={90} cy={90}
                  innerRadius={50} outerRadius={80}
                  dataKey="trades"
                  nameKey="symbol"
                >
                  {symbolStats.slice(0, 7).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, 'Trades']} />
              </PieChart>
              <div className="symbol-legend">
                {symbolStats.slice(0, 7).map((s, i) => (
                  <div key={s.symbol} className="legend-item">
                    <div className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="legend-symbol">{s.symbol}</span>
                    <span className="legend-wr">{s.winRate.toFixed(0)}% WR</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Stats */}
      {strategyStats.length > 0 && (
        <div className="chart-card card">
          <div className="chart-header"><h3 className="chart-title">Strategy Performance</h3></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Trades</th>
                  <th>Win Rate</th>
                  <th>Profit Factor</th>
                  <th>Net PnL</th>
                  <th>Avg RR</th>
                </tr>
              </thead>
              <tbody>
                {strategyStats.map((s) => (
                  <tr key={s.strategyId}>
                    <td style={{ fontWeight: 600 }}>{s.strategyName}</td>
                    <td style={{ color: 'var(--color-muted-foreground)' }}>{s.trades}</td>
                    <td>
                      <span className={`badge ${s.winRate >= 50 ? 'badge-success' : 'badge-loss'}`}>
                        {s.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ color: s.profitFactor >= 1.5 ? '#22c55e' : 'var(--color-muted-foreground)' }}>
                      {s.profitFactor >= 999 ? '∞' : s.profitFactor.toFixed(2)}
                    </td>
                    <td>
                      <span style={{ color: s.netPnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {formatCurrency(s.netPnl, 'USD', true)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-muted-foreground)' }}>
                      {s.avgRR.toFixed(2)}R
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {calendarData && calendarData.length > 0 && (
        <MonthlyCalendar data={calendarData} />
      )}

      <style jsx>{`
        .analytics-layout { display: flex; flex-direction: column; gap: 20px; }
        .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .chart-row { grid-template-columns: 1fr; } }
        .chart-card { padding: 0; overflow: hidden; }
        .chart-card.large { grid-column: span 1; }
        .chart-header { padding: 18px 20px 0; }
        .chart-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; padding-bottom: 16px; }
        .session-table { overflow-x: auto; }
        .symbol-pie-wrap { display: flex; align-items: center; gap: 16px; padding: 0 16px 16px; flex-wrap: wrap; }
        .symbol-legend { display: flex; flex-direction: column; gap: 6px; }
        .legend-item { display: flex; align-items: center; gap: 8px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .legend-symbol { font-size: 0.8125rem; font-weight: 500; color: var(--color-foreground); min-width: 60px; }
        .legend-wr { font-size: 0.75rem; color: #71717a; }
        .table-scroll { overflow-x: auto; }
      `}</style>
    </div>
  );
}
