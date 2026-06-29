'use client';

import { formatCurrency, formatPercent, getPnLColor } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  format?: 'currency' | 'percent' | 'number' | 'raw';
  currency?: string;
  change?: number;       // % change from last period
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  positive?: boolean;    // override color
  id?: string;
}

export function StatCard({
  label,
  value,
  format = 'raw',
  currency = 'USD',
  change,
  prefix,
  suffix,
  icon,
  positive,
  id,
}: StatCardProps) {
  function formatValue(): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) return String(value);
    switch (format) {
      case 'currency': return formatCurrency(num, currency);
      case 'percent': return formatPercent(num);
      case 'number': return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
      default: return String(value);
    }
  }

  const isPositive = positive ?? (typeof value === 'number' ? value >= 0 : true);
  const colorClass = format === 'currency' || format === 'percent'
    ? getPnLColor(typeof value === 'number' ? value : parseFloat(String(value)))
    : '';

  return (
    <div className="stat-card card" id={id}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>

      <div className={`stat-value ${colorClass}`}>
        {prefix && <span className="stat-prefix">{prefix}</span>}
        {formatValue()}
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>

      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change).toFixed(1)}% from last month</span>
        </div>
      )}

      <style jsx>{`
        .stat-card {
          padding: 20px 24px;
          display: flex; flex-direction: column; gap: 8px;
          transition: border-color 0.15s;
        }
        .stat-card:hover { border-color: #3f3f46; }
        .stat-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .stat-label {
          font-size: 0.75rem; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--color-muted-foreground);
        }
        .stat-icon { color: var(--color-placeholder); }
        .stat-value {
          font-size: 1.875rem; font-weight: 700;
          letter-spacing: -0.04em; line-height: 1;
          color: var(--color-foreground);
        }
        .stat-prefix, .stat-suffix { font-size: 1rem; font-weight: 500; }
        .stat-change {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 500;
        }
        .stat-change.positive { color: #22c55e; }
        .stat-change.negative { color: #ef4444; }
        :global(.text-success) { color: #22c55e; }
        :global(.text-loss) { color: #ef4444; }
        :global(.text-muted-foreground) { color: var(--color-muted-foreground); }
      `}</style>
    </div>
  );
}
