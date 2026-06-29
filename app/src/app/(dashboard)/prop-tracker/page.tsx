import { PageHeader } from '@/components/shared/PageHeader';
import { PropTrackerClient } from '@/components/accounts/PropTrackerClient';
import { getAccountsAction } from '@/actions/account.actions';
import { getTradesAction } from '@/actions/trade.actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prop Firm Tracker',
  description: 'Track your prop firm challenge progress and risk metrics',
};

export const dynamic = 'force-dynamic';

export default async function PropTrackerPage() {
  const [accounts, { trades }] = await Promise.all([
    getAccountsAction(),
    getTradesAction({ limit: 200, status: 'closed' }),
  ]);

  const propAccounts = accounts.filter((a) => a.type === 'prop');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Prop Firm Tracker"
        description="Monitor challenge progress, risk limits, and daily drawdown in real time"
        badge={`${propAccounts.length} accounts`}
      />
      <PropTrackerClient accounts={propAccounts} trades={trades} />
    </div>
  );
}
