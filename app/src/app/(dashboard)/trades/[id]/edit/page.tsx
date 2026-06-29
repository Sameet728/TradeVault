import { getAccountsAction } from '@/actions/account.actions';
import { getStrategiesAction } from '@/actions/strategy.actions';
import { getTradeAction } from '@/actions/trade.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { TradeForm } from '@/components/trades/TradeForm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Trade',
  description: 'Update your trade details',
};

export default async function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [accounts, strategies, trade] = await Promise.all([
    getAccountsAction(),
    getStrategiesAction(),
    getTradeAction(resolvedParams.id),
  ]);

  if (!trade) {
    notFound();
  }

  if (accounts.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Edit Trade" />
        <div className="card">
          <p>Please create a Trading Account in Settings first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Edit Trade"
        description="Update your trade details, logs, and screenshots"
      />
      <TradeForm accounts={accounts} strategies={strategies} trade={trade as any} />
    </div>
  );
}
