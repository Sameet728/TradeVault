'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, ReferenceLine,
} from 'recharts';
import type { EquityPoint, MonthlyReturn } from '@/types/analytics.types';
import { formatCurrency } from '@/lib/utils';

interface DashboardChartsProps {
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
}

const CustomTooltipStyle = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--color-foreground)',
  fontSize: 13,
};

export function DashboardCharts({ equityCurve, monthlyReturns }: DashboardChartsProps) {
  return (
    <div className="charts-grid">
      {/* Equity Curve */}
      <div className="chart-card card">
        <div className="chart-header">
          <h3 className="chart-title">Equity Curve</h3>
          <span className="chart-subtitle">{equityCurve.length} trades</span>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={equityCurve} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={55}
              />
              <Tooltip
                contentStyle={CustomTooltipStyle}
                formatter={(v: any, name: any) => [formatCurrency(v), 'Balance']}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#equityGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Returns */}
      <div className="chart-card card">
        <div className="chart-header">
          <h3 className="chart-title">Monthly Returns</h3>
          <span className="chart-subtitle">{monthlyReturns.length} months</span>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyReturns} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-placeholder)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={55}
              />
              <Tooltip
                contentStyle={CustomTooltipStyle}
                formatter={(v: any, name: any) => [formatCurrency(v), 'PnL']}
              />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Bar
                dataKey="pnl"
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
                // Color bars based on positive/negative
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
        .chart-card { padding: 0; overflow: hidden; }
        .chart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 0;
        }
        .chart-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .chart-subtitle { font-size: 0.75rem; color: var(--color-placeholder); }
        .chart-body { padding: 16px 8px 16px; }
      `}</style>
    </div>
  );
}
