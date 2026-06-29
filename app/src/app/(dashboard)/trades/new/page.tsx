import { getAccountsAction } from '@/actions/account.actions';
import { getStrategiesAction } from '@/actions/strategy.actions';
import { TradeForm } from '@/components/trades/TradeForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Trade',
  description: 'Log a new trade in your journal',
};

export default async function NewTradePage() {
  const [accounts, strategies] = await Promise.all([
    getAccountsAction(),
    getStrategiesAction(),
  ]);

  if (accounts.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Add Trade" description="Log a new trade" />
        <div className="card">
          <EmptyState
            icon={<Wallet size={20} />}
            title="No trading accounts"
            description="You need at least one trading account before you can log trades."
            action={
              <Link href="/accounts" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                Create Account →
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Log Trade"
        description="Record your trade details, strategy parameters, and journal notes."
      />
      <TradeForm accounts={accounts} strategies={strategies} />
    </div>
  );
}
