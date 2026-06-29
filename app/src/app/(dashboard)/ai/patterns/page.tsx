import { PageHeader } from '@/components/shared/PageHeader';
import { AIPatternsClient } from '@/components/ai/AIPatternsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Pattern Discovery',
  description: 'Discover your trading edge with AI-powered pattern analysis',
};

export default function PatternsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Pattern Discovery"
        description="Uncover your trading edge — AI analyzes your trade history to find patterns in sessions, symbols, and strategy parameters"
      />
      <AIPatternsClient />
    </div>
  );
}
