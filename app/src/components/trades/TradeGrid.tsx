'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, getPnLBgColor } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { Trade } from '@/types/trade.types';

export function TradeGrid({
  trades,
  totalPages,
  currentPage,
  total,
}: {
  trades: Trade[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}) {
  if (trades.length === 0) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
        <p>No trades found. Start by logging your first trade!</p>
      </div>
    );
  }

  return (
    <div className="trade-grid-wrap">
      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {trades.map((trade) => (
          <Link href={`/trades/${trade._id}`} key={trade._id} className="trade-card-link" style={{ textDecoration: 'none' }}>
            <div className="card trade-card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              
              {/* Thumbnail */}
              <div className="trade-thumbnail" style={{ height: '160px', background: 'var(--color-border-subtle)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {trade.screenshots && trade.screenshots.length > 0 ? (
                  <img 
                    src={trade.screenshots[1] || trade.screenshots[0]} 
                    alt={`${trade.symbol} trade`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--color-muted-foreground)' }}>
                    <ImageIcon size={32} opacity={0.5} />
                    <span style={{ fontSize: '0.75rem' }}>No image</span>
                  </div>
                )}
                
                {/* Status Badge Overlays */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                  <span className={`badge ${trade.direction === 'LONG' ? 'badge-success' : 'badge-loss'}`} style={{ backdropFilter: 'blur(4px)', background: trade.direction === 'LONG' ? 'var(--color-success)' : 'var(--color-loss)', color: 'white', border: 'none' }}>
                    {trade.direction}
                  </span>
                </div>
                
                {trade.pnl !== undefined && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className={`badge ${getPnLBgColor(trade.pnl)}`} style={{ backdropFilter: 'blur(4px)', fontWeight: 'bold' }}>
                      {formatCurrency(trade.pnl, 'USD', true)}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="trade-details" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-foreground)' }}>{trade.symbol}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    {formatDate(trade.tradeDate, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Entry</span>
                  <span style={{ color: 'var(--color-foreground)' }}>{trade.entryPrice.toFixed(5)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Exit</span>
                  <span style={{ color: 'var(--color-foreground)' }}>{trade.exitPrice?.toFixed(5) ?? '—'}</span>
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>{trade.session || 'No session'}</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-foreground)' }}>RR: {trade.rr != null ? `${trade.rr.toFixed(2)}` : '—'}</span>
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .trade-card-link:hover .trade-card {
          transform: translateY(-4px);
          box-shadow: var(--shadow-elevated);
          border-color: var(--color-accent);
        }
      `}</style>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && currentPage !== undefined && total !== undefined && (
        <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', padding: '16px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <span className="pag-info" style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            Page {currentPage} of {totalPages} ({total} trades)
          </span>
          <div className="pag-btns" style={{ display: 'flex', gap: '8px' }}>
            <Link
              href={`/trades?view=grid&page=${currentPage - 1}`}
              className={`pag-btn ${currentPage <= 1 ? 'disabled' : ''}`}
              aria-disabled={currentPage <= 1}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--color-foreground)', textDecoration: 'none', pointerEvents: currentPage <= 1 ? 'none' : 'auto', opacity: currentPage <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} /> Prev
            </Link>
            <Link
              href={`/trades?view=grid&page=${currentPage + 1}`}
              className={`pag-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
              aria-disabled={currentPage >= totalPages}
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--color-foreground)', textDecoration: 'none', pointerEvents: currentPage >= totalPages ? 'none' : 'auto', opacity: currentPage >= totalPages ? 0.5 : 1 }}
            >
              Next <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
