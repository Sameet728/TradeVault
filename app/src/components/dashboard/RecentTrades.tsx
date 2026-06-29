'use client';

import Link from 'next/link';
import { formatCurrency, formatDate, getPnLBgColor } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { TrendingUp, ArrowRight } from 'lucide-react';
import type { Trade } from '@/types/trade.types';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="recent-section card">
      <div className="recent-header">
        <h3 className="recent-title">Recent Trades</h3>
        <Link href="/trades" className="view-all">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {trades.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={20} />}
          title="No trades yet"
          description="Add your first trade to start tracking your performance."
          action={
            <Link href="/trades/new" className="btn-empty">Add Trade</Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Direction</th>
                <th>PnL</th>
                <th>RR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade._id}>
                  <td style={{ color: 'var(--color-muted-foreground)', fontSize: '0.8125rem' }}>
                    {formatDate(trade.tradeDate)}
                  </td>
                  <td>
                    <Link href={`/trades/${trade._id}`} className="symbol-link">
                      {trade.symbol}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${trade.direction === 'LONG' ? 'badge-success' : 'badge-loss'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPnLBgColor(trade.pnl ?? 0)}`}>
                      {trade.pnl !== undefined ? formatCurrency(trade.pnl, 'USD', true) : '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
                    {trade.rr != null ? `${trade.rr.toFixed(2)}R` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${trade.status === 'closed' ? 'badge-default' : trade.status === 'open' ? 'badge-accent' : 'badge-default'}`}>
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
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; border-bottom: 1px solid var(--color-border-subtle);
        }
        .recent-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .view-all {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.8125rem; color: #3b82f6; text-decoration: none; transition: gap 0.15s;
        }
        .view-all:hover { gap: 6px; }
        .table-wrap { overflow-x: auto; }
        .symbol-link {
          color: var(--color-foreground); text-decoration: none; font-weight: 500; font-size: 0.875rem;
          transition: color 0.15s;
        }
        .symbol-link:hover { color: #3b82f6; }
        .btn-empty {
          display: inline-flex; padding: 8px 16px;
          background: #3b82f6; border-radius: 8px;
          color: white; font-size: 0.875rem; font-weight: 500;
          text-decoration: none; transition: background 0.15s;
        }
        .btn-empty:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}
