import { getCalendarDataAction } from '@/actions/analytics.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { CalendarView } from '@/components/charts/CalendarView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View your trading results by day in a calendar view',
};

export const dynamic = 'force-dynamic';

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? now.getFullYear().toString());
  const month = parseInt(params.month ?? now.getMonth().toString());

  const dateFrom = new Date(year, month, 1).toISOString();
  const dateTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const calendarData = await getCalendarDataAction({ dateFrom, dateTo });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Calendar"
        description="Your trading activity day by day"
      />
      <CalendarView calendarData={calendarData} year={year} month={month} />
    </div>
  );
}
