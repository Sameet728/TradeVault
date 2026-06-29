'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import type { CalendarDay } from '@/types/analytics.types';
import type { Trade } from '@/types/trade.types';
import { formatCurrency } from '@/lib/utils';
import { TradeGrid } from '@/components/trades/TradeGrid';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  calendarData: CalendarDay[];
  year: number;
  month: number;
  trades?: Trade[];
}

export function CalendarView({ calendarData, year, month, trades = [] }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dayMap = new Map(calendarData.map((d) => [d.date, d]));

  const firstDay = startOfMonth(new Date(year, month));
  const startWeekday = getDay(firstDay);
  const daysInMonth = getDaysInMonth(new Date(year, month));

  const prevMonth = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const nextMonth = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };

  const totalPnL = calendarData.reduce((s, d) => s + d.pnl, 0);
  const tradingDays = calendarData.length;
  const profitDays = calendarData.filter((d) => d.pnl > 0).length;

  return (
    <div className="calendar-wrap">
      {/* Header */}
      <div className="cal-header card">
        <Link
          href={`/calendar?year=${prevMonth.year}&month=${prevMonth.month}`}
          className="nav-btn"
          id="btn-cal-prev"
        >
          <ChevronLeft size={16} />
        </Link>
        <div className="cal-title-group">
          <h2 className="cal-month">{MONTH_NAMES[month]} {year}</h2>
          <div className="cal-summary">
            <span className="cal-stat">
              <span className="cal-stat-label">Trading Days</span>
              <span className="cal-stat-val">{tradingDays}</span>
            </span>
            <span className="cal-divider" />
            <span className="cal-stat">
              <span className="cal-stat-label">Profit Days</span>
              <span className="cal-stat-val" style={{ color: '#22c55e' }}>{profitDays}</span>
            </span>
            <span className="cal-divider" />
            <span className="cal-stat">
              <span className="cal-stat-label">Month PnL</span>
              <span className="cal-stat-val" style={{ color: totalPnL >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatCurrency(totalPnL, 'USD', true)}
              </span>
            </span>
          </div>
        </div>
        <Link
          href={`/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
          className="nav-btn"
          id="btn-cal-next"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Calendar Grid */}
      <div className="calendar card">
        {/* Day names */}
        <div className="cal-grid header-row">
          {DAY_NAMES.map((d) => (
            <div key={d} className="day-name">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="cal-grid days-grid">
          {/* Empty cells for start weekday */}
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = dayMap.get(dateStr);
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={day}
                className={`day-cell ${dayData?.status ?? 'none'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(dateStr)}
                role="button"
                tabIndex={0}
              >
                <span className="day-num">{day}</span>
                {dayData && (
                  <>
                    <span className="day-pnl">
                      {formatCurrency(dayData.pnl, 'USD', true)}
                    </span>
                    <span className="day-trades">{dayData.trades}t</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-swatch profit" />
          <span>Profit Day</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch loss" />
          <span>Loss Day</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch breakeven" />
          <span>Breakeven</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch none" />
          <span>No Trade</span>
        </div>
      </div>

      {/* Selected Day Trades */}
      {selectedDate && (
        <div className="selected-day-trades">
          <div className="selected-day-header">
            <h3>Trades for {format(new Date(selectedDate), 'MMM dd, yyyy')}</h3>
            <button className="close-btn" onClick={() => setSelectedDate(null)} aria-label="Close trades">
              <X size={20} />
            </button>
          </div>
          {(() => {
            const dayTrades = trades.filter(t => t.tradeDate.split('T')[0] === selectedDate);
            if (dayTrades.length === 0) return <p className="text-muted">No trades recorded on this day.</p>;
            return <TradeGrid trades={dayTrades} />;
          })()}
        </div>
      )}

      <style jsx>{`
        .calendar-wrap { display: flex; flex-direction: column; gap: 16px; }
        .cal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
        }
        .nav-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid var(--color-border); color: var(--color-muted-foreground); text-decoration: none;
          transition: all 0.15s;
        }
        .nav-btn:hover { border-color: #3f3f46; color: var(--color-foreground); }
        .cal-title-group { text-align: center; }
        .cal-month { font-size: 1.125rem; font-weight: 700; color: var(--color-foreground); margin: 0 0 6px; letter-spacing: -0.02em; }
        .cal-summary { display: flex; align-items: center; gap: 12px; }
        .cal-stat { display: flex; flex-direction: column; gap: 1px; }
        .cal-stat-label { font-size: 0.6875rem; color: #71717a; text-align: center; }
        .cal-stat-val { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); text-align: center; }
        .cal-divider { width: 1px; height: 24px; background: var(--color-border); }
        .calendar { padding: 16px; overflow: hidden; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .header-row { margin-bottom: 4px; }
        .day-name {
          text-align: center; font-size: 0.6875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-placeholder);
          padding: 6px 0;
        }
        .days-grid {}
        .day-cell {
          min-height: 72px; border-radius: 8px; cursor: pointer;
          padding: 6px 8px; display: flex; flex-direction: column;
          border: 1px solid transparent; transition: all 0.12s;
          position: relative;
        }
        .day-cell.empty { background: transparent; cursor: default; }
        .day-cell.none { background: rgba(255,255,255,0.01); border-color: var(--color-border-subtle); }
        .day-cell.profit {
          background: rgba(34,197,94,0.06);
          border-color: rgba(34,197,94,0.15);
        }
        .day-cell.loss {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.15);
        }
        .day-cell.breakeven {
          background: rgba(245,158,11,0.04);
          border-color: rgba(245,158,11,0.12);
        }
        .day-cell.today { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f620 inset; }
        .day-cell.selected { border-color: var(--color-foreground); box-shadow: 0 0 0 1px var(--color-foreground) inset; }
        .day-cell:hover:not(.empty) { border-color: var(--color-border); }
        .day-num {
          font-size: 0.8125rem; font-weight: 600; color: var(--color-muted-foreground);
        }
        .day-cell.today .day-num { color: #3b82f6; }
        .day-pnl {
          font-size: 0.6875rem; font-weight: 600; margin-top: auto;
          color: inherit;
        }
        .day-cell.profit .day-pnl { color: #22c55e; }
        .day-cell.loss .day-pnl { color: #ef4444; }
        .day-cell.breakeven .day-pnl { color: #f59e0b; }
        .day-trades { font-size: 0.625rem; color: var(--color-placeholder); }
        .legend {
          display: flex; align-items: center; gap: 16px;
          font-size: 0.75rem; color: #71717a;
        }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-swatch { width: 12px; height: 12px; border-radius: 3px; }
        .legend-swatch.profit { background: rgba(34,197,94,0.4); border: 1px solid rgba(34,197,94,0.3); }
        .legend-swatch.loss { background: rgba(239,68,68,0.4); border: 1px solid rgba(239,68,68,0.3); }
        .legend-swatch.breakeven { background: rgba(245,158,11,0.3); border: 1px solid rgba(245,158,11,0.25); }
        .legend-swatch.none { background: var(--color-border-subtle); border: 1px solid var(--color-border-subtle); }
        
        .selected-day-trades {
          margin-top: 24px;
          animation: slideUp 0.3s ease;
        }
        .selected-day-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .selected-day-header h3 { font-size: 1.25rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .close-btn { background: none; border: none; color: var(--color-muted-foreground); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; }
        .close-btn:hover { background: var(--color-border-subtle); color: var(--color-foreground); }
        .text-muted { color: var(--color-muted-foreground); font-size: 0.875rem; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .cal-summary { gap: 8px; }
          .cal-stat-val { font-size: 0.8125rem; }
          .day-cell { min-height: 60px; padding: 4px; }
          .day-pnl { font-size: 0.625rem; }
        }
      `}</style>
    </div>
  );
}
