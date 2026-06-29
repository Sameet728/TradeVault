import { getTradeAction } from '@/actions/trade.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Edit2, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate, getPnLBgColor } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade Details',
  description: 'View trade details and screenshots',
};

export default async function TradeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const trade = await getTradeAction(resolvedParams.id);

  if (!trade) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '16px' }}>
        <Link href="/trades" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted-foreground)', textDecoration: 'none', fontSize: '0.875rem' }}>
          <ArrowLeft size={14} /> Back to Trades
        </Link>
      </div>

      <PageHeader
        title={`${trade.symbol} Trade`}
        description={formatDate(trade.tradeDate, 'MMMM dd, yyyy')}
        actions={
          <Link href={`/trades/${trade._id}/edit`} className="btn-primary-link">
            <Edit2 size={14} />
            Edit Trade
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Screenshots & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-foreground)' }}>Screenshots</h3>
            
            {trade.screenshots && trade.screenshots.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {trade.screenshots.map((url: string, i: number) => (
                  <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
                    <img 
                      src={url} 
                      alt={`Screenshot ${i + 1}`}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted-foreground)', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                No screenshots attached to this trade.
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-foreground)' }}>Journal Notes</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '8px' }}>Trade Idea</h4>
                <p style={{ fontSize: '0.9375rem', color: trade.notes?.idea ? 'var(--color-foreground)' : 'var(--color-placeholder)', whiteSpace: 'pre-wrap' }}>
                  {trade.notes?.idea || 'No idea recorded.'}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '8px' }}>Mistakes</h4>
                <p style={{ fontSize: '0.9375rem', color: trade.notes?.mistakes ? 'var(--color-foreground)' : 'var(--color-placeholder)', whiteSpace: 'pre-wrap' }}>
                  {trade.notes?.mistakes || 'No mistakes recorded.'}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '8px' }}>Lessons Learned</h4>
                <p style={{ fontSize: '0.9375rem', color: trade.notes?.lessons ? 'var(--color-foreground)' : 'var(--color-placeholder)', whiteSpace: 'pre-wrap' }}>
                  {trade.notes?.lessons || 'No lessons recorded.'}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '8px' }}>Emotion</h4>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.875rem', color: trade.notes?.emotion ? 'var(--color-foreground)' : 'var(--color-placeholder)' }}>
                  {trade.notes?.emotion || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trade Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px', color: 'var(--color-foreground)' }}>Execution Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Status</span>
                <span className={`badge ${trade.status === 'open' ? 'badge-accent' : 'badge-default'}`}>
                  {trade.status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Direction</span>
                <span className={`badge ${trade.direction === 'LONG' ? 'badge-success' : 'badge-loss'}`}>
                  {trade.direction}
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Entry Price</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{trade.entryPrice.toFixed(5)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Stop Loss</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{trade.stopLoss?.toFixed(5) || '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Take Profit</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{trade.takeProfit?.toFixed(5) || '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Exit Price</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{trade.exitPrice?.toFixed(5) || '—'}</span>
              </div>
              
              <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Net PnL</span>
                {trade.pnl !== undefined ? (
                  <span className={`badge ${getPnLBgColor(trade.pnl)}`} style={{ fontSize: '1rem' }}>
                    {formatCurrency(trade.pnl, 'USD', true)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-muted-foreground)' }}>—</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Risk:Reward</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{trade.rr != null ? `${trade.rr.toFixed(2)}R` : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Session</span>
                <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{trade.session || '—'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
