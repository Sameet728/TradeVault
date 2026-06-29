'use client';

import { formatCurrency, formatPercent, getPnLColor } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  format?: 'currency' | 'percent' | 'number' | 'raw';
  currency?: string;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  positive?: boolean;
  id?: string;
}

export function StatCard({
  label, value, format = 'raw', currency = 'USD',
  change, prefix, suffix, icon, positive, id,
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

  const numVal = typeof value === 'number' ? value : parseFloat(String(value));
  const colorClass = (format === 'currency' || format === 'percent') && !isNaN(numVal)
    ? getPnLColor(numVal) : '';

  return (
    <div className="stat-card card" id={id}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>

      <div className={`stat-val ${colorClass}`}>
        {prefix && <span className="stat-affix">{prefix}</span>}
        {formatValue()}
        {suffix && <span className="stat-affix"> {suffix}</span>}
      </div>

      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          <span>{Math.abs(change).toFixed(1)}% vs last month</span>
        </div>
      )}

      <style jsx>{`
        .stat-card {
          padding: 16px 18px;
          display: flex; flex-direction: column; gap: 6px;
          transition: border-color 0.12s ease;
          position: relative; overflow: hidden;
        }
        .stat-card:hover { border-color: #3F3F46; }

        .stat-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .stat-label {
          font-size: 0.6875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: var(--color-placeholder);
        }
        .stat-icon { color: var(--color-placeholder); opacity: 0.6; }

        .stat-val {
          font-size: 1.625rem; font-weight: 700;
          letter-spacing: -0.05em; line-height: 1;
          color: var(--color-foreground);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .stat-affix {
          font-size: 1rem; font-weight: 500;
          letter-spacing: -0.02em; opacity: 0.7;
        }
        .stat-change {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.6875rem; font-weight: 500;
          margin-top: 2px;
        }
        .stat-change.positive { color: var(--color-success); }
        .stat-change.negative { color: var(--color-loss); }

        :global(.text-success) { color: var(--color-success); }
        :global(.text-loss) { color: var(--color-loss); }
      `}</style>
    </div>
  );
}


