'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { deleteTradeAction } from '@/actions/trade.actions';
import { formatCurrency, formatDate, getPnLBgColor } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { TrendingUp, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Trade } from '@/types/trade.types';

interface TradeTableProps {
  trades: Trade[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export function TradeTable({ trades, totalPages, currentPage, total }: TradeTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (deletingId === id) {
      startTransition(async () => {
        const result = await deleteTradeAction(id);
        if (result.error) toast.error(result.error);
        else { toast.success('Trade deleted'); router.refresh(); }
        setDeletingId(null);
      });
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  }

  if (trades.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<TrendingUp size={20} />}
          title="No trades found"
          description="No trades match your current filters, or you haven't added any trades yet."
          action={
            <Link href="/trades/new" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
              Log your first trade →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="trade-table-wrap">
      <div className="card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Direction</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>PnL</th>
                <th>RR</th>
                <th>Session</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade._id}>
                  <td style={{ color: '#71717a', fontSize: '0.8125rem' }}>
                    {formatDate(trade.tradeDate, 'MMM dd, yy')}
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
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                    {trade.entryPrice.toFixed(5)}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                    {trade.exitPrice?.toFixed(5) ?? '—'}
                  </td>
                  <td>
                    {trade.pnl !== undefined ? (
                      <span className={`badge ${getPnLBgColor(trade.pnl)}`}>
                        {formatCurrency(trade.pnl, 'USD', true)}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                    {trade.rr != null ? `${trade.rr.toFixed(2)}R` : '—'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#71717a' }}>
                    {trade.session ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${trade.status === 'open' ? 'badge-accent' : 'badge-default'}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <Link href={`/trades/${trade._id}/edit`} className="action-btn" title="Edit">
                        <Edit2 size={13} />
                      </Link>
                      <button
                        className={`action-btn delete ${deletingId === trade._id ? 'confirming' : ''}`}
                        onClick={() => handleDelete(trade._id)}
                        disabled={isPending}
                        title={deletingId === trade._id ? 'Click again to confirm delete' : 'Delete trade'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <span className="pag-info">
            Page {currentPage} of {totalPages} ({total} trades)
          </span>
          <div className="pag-btns">
            <Link
              href={`/trades?page=${currentPage - 1}`}
              className={`pag-btn ${currentPage <= 1 ? 'disabled' : ''}`}
              aria-disabled={currentPage <= 1}
            >
              <ChevronLeft size={14} /> Prev
            </Link>
            <Link
              href={`/trades?page=${currentPage + 1}`}
              className={`pag-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
              aria-disabled={currentPage >= totalPages}
            >
              Next <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .trade-table-wrap { display: flex; flex-direction: column; gap: 16px; }
        .table-scroll { overflow-x: auto; }
        .symbol-link {
          color: var(--color-foreground); text-decoration: none; font-weight: 600; font-size: 0.875rem;
          transition: color 0.15s; white-space: nowrap;
        }
        .symbol-link:hover { color: #3b82f6; }
        .action-cell { display: flex; align-items: center; gap: 4px; }
        .action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 6px;
          color: #71717a; background: none; border: none; cursor: pointer;
          transition: all 0.15s; text-decoration: none;
        }
        .action-btn:hover { color: var(--color-foreground); background: var(--color-border-subtle); }
        .action-btn.delete:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .action-btn.delete.confirming { color: #ef4444; background: rgba(239,68,68,0.12); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pagination {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .pag-info { font-size: 0.8125rem; color: #71717a; }
        .pag-btns { display: flex; gap: 8px; }
        .pag-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 8px;
          border: 1px solid var(--color-border); color: var(--color-muted-foreground);
          font-size: 0.8125rem; text-decoration: none; transition: all 0.15s;
        }
        .pag-btn:hover:not(.disabled) { border-color: #3f3f46; color: var(--color-foreground); }
        .pag-btn.disabled { opacity: 0.4; pointer-events: none; }
      `}</style>
    </div>
  );
}
