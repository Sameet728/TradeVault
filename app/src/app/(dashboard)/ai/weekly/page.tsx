import { PageHeader } from '@/components/shared/PageHeader';
import { AIWeeklyClient } from '@/components/ai/AIWeeklyClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekly AI Report',
  description: 'Get an AI-generated weekly trading performance summary',
};

export default function WeeklyReportPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Weekly AI Report"
        description="Get a comprehensive AI-generated analysis of your weekly trading performance"
      />
      <AIWeeklyClient />
    </div>
  );
}
