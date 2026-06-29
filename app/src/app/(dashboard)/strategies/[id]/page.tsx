import { getStrategyAction } from '@/actions/strategy.actions';
import { getAdvancedStatsAction } from '@/actions/analytics.actions';
import { getTradesAction } from '@/actions/trade.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { StrategyForm } from '@/components/strategies/StrategyForm';
import { AdvancedMetricsCards } from '@/components/charts/AdvancedMetricsCards';
import { TradeGrid } from '@/components/trades/TradeGrid';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Strategy Dashboard' };

export default async function EditStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [strategy, advancedMetrics, tradesRes] = await Promise.all([
    getStrategyAction(id),
    getAdvancedStatsAction({ strategyId: id }),
    getTradesAction({ strategyId: id, limit: 100 })
  ]);

  if (!strategy) notFound();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      <PageHeader
        title={`${strategy.name} Analytics`}
        description="Performance metrics, trade history, and parameters for this strategy."
      />
      
      {advancedMetrics && tradesRes.trades.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Strategy Metrics</h2>
            <AdvancedMetricsCards metrics={advancedMetrics} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Recent Trades</h2>
            <TradeGrid trades={tradesRes.trades} />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '48px', padding: '24px', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <p style={{ color: 'var(--color-muted-foreground)' }}>Take some trades using this strategy to see analytics and metrics here!</p>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Strategy Settings</h2>
        <StrategyForm strategy={strategy} />
      </div>
    </div>
  );
}
