import { PageHeader } from '@/components/shared/PageHeader';
import { StrategyForm } from '@/components/strategies/StrategyForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Strategy',
  description: 'Create a new trading strategy with custom parameters',
};

export default function NewStrategyPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="New Strategy"
        description="Define your trading strategy with custom parameters and a pre-trade checklist."
      />
      <StrategyForm />
    </div>
  );
}
