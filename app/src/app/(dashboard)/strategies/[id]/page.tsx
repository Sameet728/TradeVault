import { getStrategyAction } from '@/actions/strategy.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { StrategyForm } from '@/components/strategies/StrategyForm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Strategy' };

export default async function EditStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const strategy = await getStrategyAction(id);
  if (!strategy) notFound();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Edit: ${strategy.name}`}
        description="Update your strategy parameters and checklist."
      />
      <StrategyForm strategy={strategy} />
    </div>
  );
}
