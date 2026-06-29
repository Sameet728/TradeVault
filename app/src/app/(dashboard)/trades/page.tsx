import { getTradesAction } from '@/actions/trade.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { TradeTable } from '@/components/trades/TradeTable';
import { TradeGrid } from '@/components/trades/TradeGrid';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trades',
  description: 'View and manage all your trades',
};

export const dynamic = 'force-dynamic';

interface TradesPageProps {
  searchParams: Promise<{ page?: string; symbol?: string; direction?: string; status?: string; view?: string }>;
}

export default async function TradesPage({ searchParams }: TradesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const view = params.view === 'grid' ? 'grid' : 'list';

  const { trades, total, totalPages } = await getTradesAction({
    symbol: params.symbol,
    direction: params.direction as 'LONG' | 'SHORT' | undefined,
    status: params.status as 'open' | 'closed' | undefined,
    page,
    limit: view === 'grid' ? 24 : 25,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trades"
        description="Your complete trade history"
        badge={`${total} total`}
        actions={
          <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="view-toggle" style={{ display: 'flex', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
              <Link href={`/trades?view=list`} style={{ padding: '6px 12px', fontSize: '0.8125rem', background: view === 'list' ? 'var(--color-border-subtle)' : 'transparent', color: view === 'list' ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', textDecoration: 'none' }}>
                List
              </Link>
              <Link href={`/trades?view=grid`} style={{ padding: '6px 12px', fontSize: '0.8125rem', background: view === 'grid' ? 'var(--color-border-subtle)' : 'transparent', color: view === 'grid' ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', textDecoration: 'none' }}>
                Grid
              </Link>
            </div>
            <Link href="/trades/new" id="btn-add-trade" className="btn-primary-link">
              <Plus size={14} />
              Add Trade
            </Link>
          </div>
        }
      />
      {view === 'grid' ? (
        <TradeGrid
          trades={trades}
          totalPages={totalPages}
          currentPage={page}
          total={total}
        />
      ) : (
        <TradeTable
          trades={trades}
          totalPages={totalPages}
          currentPage={page}
          total={total}
        />
      )}
    </div>
  );
}
