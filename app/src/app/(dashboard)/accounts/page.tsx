import { getAccountsAction } from '@/actions/account.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { AccountsClient } from '@/components/accounts/AccountsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounts',
  description: 'Manage your trading accounts',
};

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const accounts = await getAccountsAction();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trading Accounts"
        description="Manage your personal and prop firm trading accounts"
        badge={`${accounts.length}`}
      />
      <AccountsClient accounts={accounts} />
    </div>
  );
}
