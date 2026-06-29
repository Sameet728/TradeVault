'use client';

import Link from 'next/link';
import { formatCurrency, formatDate, getPnLBgColor } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import type { Trade } from '@/types/trade.types';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="recent-section card">
      <div className="recent-header">
        <div>
          <h3 className="recent-title">Recent Trades</h3>
          <span className="recent-sub">Last {trades.length} closed positions</span>
        </div>
        <Link href="/trades" className="view-all">
          View all <ArrowUpRight size={13} />
        </Link>
      </div>

      {trades.length === 0 ? (
        <div style={{ padding: '16px' }}>
          <EmptyState
            icon={<TrendingUp size={20} />}
            title="No trades yet"
            description="Upload your MT5 history or create your first trade to start building your edge."
            action={<Link href="/trades/new" className="btn-add">Add Trade</Link>}
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>PnL</th>
                <th>RR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade._id}>
                  <td style={{ color: 'var(--color-muted-foreground)' }}>
                    {formatDate(trade.tradeDate)}
                  </td>
                  <td>
                    <Link href={`/trades/${trade._id}`} className="symbol-link">
                      {trade.symbol}
                    </Link>
                  </td>
                  <td>
                    <span className={`direction-badge ${trade.direction === 'LONG' ? 'long' : 'short'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td>
                    <span className={trade.pnl !== undefined && trade.pnl >= 0 ? 'pnl-pos' : 'pnl-neg'}>
                      {trade.pnl !== undefined ? formatCurrency(trade.pnl, 'USD', true) : '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                    {trade.rr != null ? `${trade.rr.toFixed(2)}R` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${trade.status === 'open' ? 'badge-accent' : 'badge-default'}`}>
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .recent-section { padding: 0; overflow: hidden; }
        .recent-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 16px 18px 14px;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .recent-title {
          font-size: 0.9375rem; font-weight: 600;
          color: var(--color-foreground); margin: 0;
          letter-spacing: -0.02em;
        }
        .recent-sub {
          font-size: 0.6875rem; color: var(--color-placeholder); display: block; margin-top: 2px;
        }
        .view-all {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 500;
          color: var(--color-accent); text-decoration: none;
          transition: gap 0.12s, opacity 0.12s;
          margin-top: 2px; flex-shrink: 0;
        }
        .view-all:hover { opacity: 0.8; gap: 6px; }
        .table-wrap { overflow-x: auto; }
        .symbol-link {
          color: var(--color-foreground); text-decoration: none;
          font-weight: 600; font-size: 0.8125rem;
          letter-spacing: -0.01em;
          transition: color 0.12s;
          font-variant-numeric: tabular-nums;
        }
        .symbol-link:hover { color: var(--color-accent); }

        /* Direction badge */
        .direction-badge {
          display: inline-flex; align-items: center;
          padding: 1px 6px; border-radius: 3px;
          font-size: 0.625rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .direction-badge.long {
          background: rgba(37,99,235,0.1); color: #60A5FA;
        }
        .direction-badge.short {
          background: rgba(245,158,11,0.1); color: var(--color-warning);
        }

        /* PnL values */
        .pnl-pos { color: var(--color-success); font-weight: 600; font-variant-numeric: tabular-nums; }
        .pnl-neg { color: var(--color-loss); font-weight: 600; font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
}
