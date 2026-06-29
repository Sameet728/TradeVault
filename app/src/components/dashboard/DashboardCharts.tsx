'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, ReferenceLine, Cell,
} from 'recharts';
import type { EquityPoint, MonthlyReturn } from '@/types/analytics.types';
import { formatCurrency } from '@/lib/utils';

interface DashboardChartsProps {
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
}

const TooltipStyle = {
  background: '#1C1C1C',
  border: '1px solid #262626',
  borderRadius: 6,
  padding: '8px 12px',
  color: '#FAFAFA',
  fontSize: 12,
  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
};

export function DashboardCharts({ equityCurve, monthlyReturns }: DashboardChartsProps) {
  return (
    <div className="charts-wrapper">
      {/* Equity Curve — full width */}
      <div className="chart-card card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Equity Curve</h3>
            <span className="chart-sub">{equityCurve.length} data points</span>
          </div>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityCurve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1C1C1C" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#52525B', fontSize: 10 }}
                tickLine={false} axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#52525B', fontSize: 10 }}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                width={48}
              />
              <Tooltip
                contentStyle={TooltipStyle}
                formatter={(v: any) => [formatCurrency(v), 'Balance']}
                labelStyle={{ color: '#A1A1AA', marginBottom: 4 }}
                cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone" dataKey="balance"
                stroke="#2563EB" strokeWidth={1.5}
                fill="url(#equityGrad)" dot={false}
                activeDot={{ r: 3, fill: '#2563EB', stroke: '#0A0A0A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Returns */}
      <div className="chart-card card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Monthly Returns</h3>
            <span className="chart-sub">{monthlyReturns.length} months</span>
          </div>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyReturns} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1C1C1C" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#52525B', fontSize: 10 }}
                tickLine={false} axisLine={false}
              />
              <YAxis
                tick={{ fill: '#52525B', fontSize: 10 }}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                width={48}
              />
              <Tooltip
                contentStyle={TooltipStyle}
                formatter={(v: any) => [formatCurrency(v), 'PnL']}
                labelStyle={{ color: '#A1A1AA', marginBottom: 4 }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <ReferenceLine y={0} stroke="#262626" strokeWidth={1} />
              <Bar dataKey="pnl" radius={[2, 2, 0, 0]} maxBarSize={40}>
                {monthlyReturns.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        .charts-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .charts-wrapper { grid-template-columns: 1fr; }
        }
        .chart-card { padding: 0; overflow: hidden; }
        .chart-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 16px 18px 0;
        }
        .chart-title {
          font-size: 0.875rem; font-weight: 600;
          color: var(--color-foreground); margin: 0;
          letter-spacing: -0.02em;
        }
        .chart-sub {
          font-size: 0.6875rem; color: var(--color-placeholder);
          display: block; margin-top: 2px;
        }
        .chart-body { padding: 12px 6px 14px; }
      `}</style>
    </div>
  );
}
