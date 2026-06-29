'use client';

import React from 'react';
import type { CalendarDay } from '@/types/analytics.types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

export function MonthlyCalendar({ data }: { data: CalendarDay[] }) {
  if (!data || data.length === 0) return null;

  // Assume data spans a single month for the heatmap, or we just take the current month
  // We can group by month if we wanted, but let's just show the most recent month present in data
  const latestDateStr = data[data.length - 1].date;
  const currentMonthDate = parseISO(latestDateStr);
  
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Create a map for quick lookup
  const dayMap = new Map<string, CalendarDay>();
  data.forEach(d => dayMap.set(d.date, d));

  const startDayOfWeek = getDay(monthStart); // 0 = Sunday
  
  // Padding days
  const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`blank-${i}`} className="calendar-cell empty" />);

  const days = daysInMonth.map(date => {
    const dStr = format(date, 'yyyy-MM-dd');
    const dData = dayMap.get(dStr);
    
    let bg = 'var(--color-background)';
    let color = 'var(--color-foreground)';
    if (dData) {
      if (dData.status === 'profit') {
        bg = 'var(--color-success-muted)';
        color = 'var(--color-success)';
      } else if (dData.status === 'loss') {
        bg = 'var(--color-loss-muted)';
        color = 'var(--color-loss)';
      } else if (dData.status === 'breakeven') {
        bg = 'var(--color-warning-muted)';
        color = 'var(--color-warning)';
      }
    }

    return (
      <div key={dStr} className="calendar-cell" style={{ background: bg, borderColor: 'var(--color-border)' }}>
        <span className="day-number">{format(date, 'd')}</span>
        {dData && dData.trades > 0 ? (
          <div className="day-data">
            <span style={{ color }}>{dData.pnl > 0 ? '+' : ''}${dData.pnl.toFixed(2)}</span>
            <br />
            <span className="trade-count">{dData.trades} trades</span>
          </div>
        ) : (
          <div className="day-data empty-day">$ 0.00<br/>0 trades</div>
        )}
      </div>
    );
  });

  return (
    <div className="monthly-calendar card">
      <h3 className="section-title">Monthly Trading Performance Summary</h3>
      <p className="section-desc">Overview of daily trading results, including total profit and loss, win rates, and cumulative P&L</p>
      
      <div className="calendar-header">
        <h4>{format(currentMonthDate, 'MMMM yyyy')}</h4>
      </div>

      <div className="calendar-grid">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
        {blanks}
        {days}
      </div>

      <style jsx>{`
        .monthly-calendar { padding: 24px; margin-top: 20px; }
        .section-title { font-size: 1.25rem; font-weight: 600; margin: 0 0 4px 0; color: var(--color-foreground); }
        .section-desc { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0 24px 0; }
        
        .calendar-header { text-align: center; font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; color: var(--color-foreground); }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: -1px; /* Overlap borders */
        }
        
        .weekday {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          color: var(--color-muted-foreground);
        }
        
        .calendar-cell {
          border: 1px solid var(--color-border);
          min-height: 80px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          transition: background 0.2s;
        }
        .calendar-cell.empty { border: none; background: transparent; }
        
        .day-number { font-size: 0.75rem; color: var(--color-muted-foreground); margin-bottom: auto; }
        
        .day-data { font-size: 0.75rem; font-weight: 600; text-align: right; display: block; line-height: 1.2; }
        .trade-count { font-size: 0.65rem; font-weight: 400; color: var(--color-muted-foreground); display: block; margin-top: 2px; }
        .empty-day { color: var(--color-muted-foreground); opacity: 0.5; font-weight: 400; }
        
        @media (max-width: 768px) {
          .calendar-cell { min-height: 60px; padding: 4px; }
          .day-data { font-size: 0.65rem; }
        }
      `}</style>
    </div>
  );
}
