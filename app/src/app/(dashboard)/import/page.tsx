import { PageHeader } from '@/components/shared/PageHeader';
import { ImportClient } from '@/components/import/ImportClient';
import { getAccountsAction } from '@/actions/account.actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Import Trades',
  description: 'Bulk import trades from MT5, MT4, or other platforms',
};

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  const accounts = await getAccountsAction();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Import Trades"
        description="Bulk import trades from MT5, MT4, MatchTrader, or cTrader CSV exports"
      />
      <ImportClient accounts={accounts} />
    </div>
  );
}
