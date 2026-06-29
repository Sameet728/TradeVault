import { PageHeader } from '@/components/shared/PageHeader';
import { AIReviewClient } from '@/components/ai/AIReviewClient';
import { getTradesAction } from '@/actions/trade.actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Trade Review',
  description: 'Get AI-powered analysis of your trades',
};

export const dynamic = 'force-dynamic';

export default async function AIReviewPage() {
  const { trades } = await getTradesAction({ limit: 50, status: 'closed' });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Trade Review"
        description="Select any trade to get an in-depth AI analysis powered by Gemini 2.5 Flash"
      />
      <AIReviewClient trades={trades} />
    </div>
  );
}
