'use client';

import React from 'react';
import type { CalendarDay } from '@/types/analytics.types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export function MonthlyCalendar({ data }: { data: CalendarDay[] }) {
  if (!data || data.length === 0) return null;

  const latestDateStr = data[data.length - 1].date;
  const currentMonthDate = parseISO(latestDateStr);
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayMap = new Map<string, CalendarDay>();
  data.forEach(d => dayMap.set(d.date, d));

  const startDayOfWeek = getDay(monthStart);

  // Month summary stats
  const totalPnL = data.reduce((s, d) => s + d.pnl, 0);
  const profitDays = data.filter(d => d.pnl > 0).length;
  const lossDays = data.filter(d => d.pnl < 0).length;
  const totalTrades = data.reduce((s, d) => s + d.trades, 0);

  return (
    <div className="monthly-cal card">
      {/* Header */}
      <div className="cal-top">
        <div>
          <div className="cal-month-label">{format(currentMonthDate, 'MMMM yyyy')}</div>
          <div className="cal-subtitle">Monthly trading performance</div>
        </div>
        <div className="cal-summary-row">
          <div className="cal-stat">
            <span className="cal-stat-val" style={{ color: totalPnL >= 0 ? 'var(--color-success)' : 'var(--color-loss)' }}>
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
            </span>
            <span className="cal-stat-label">Month PnL</span>
          </div>
          <div className="cal-divider-v" />
          <div className="cal-stat">
            <span className="cal-stat-val" style={{ color: 'var(--color-success)' }}>{profitDays}</span>
            <span className="cal-stat-label">Profit Days</span>
          </div>
          <div className="cal-divider-v" />
          <div className="cal-stat">
            <span className="cal-stat-val" style={{ color: 'var(--color-loss)' }}>{lossDays}</span>
            <span className="cal-stat-label">Loss Days</span>
          </div>
          <div className="cal-divider-v" />
          <div className="cal-stat">
            <span className="cal-stat-val">{totalTrades}</span>
            <span className="cal-stat-label">Total Trades</span>
          </div>
        </div>
      </div>

      {/* Scrollable calendar grid */}
      <div className="cal-scroll-wrap">
        <div className="cal-grid-wrap">
          {/* Day name headers */}
          <div className="cal-header-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="cal-days-grid">
            {/* Empty leading cells */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`e${i}`} className="cal-cell empty" />
            ))}

            {daysInMonth.map(date => {
              const dStr = format(date, 'yyyy-MM-dd');
              const dData = dayMap.get(dStr);
              const status = dData?.status ?? 'none';
              const hasTrades = dData && dData.trades > 0;

              return (
                <div key={dStr} className={`cal-cell ${status}`}>
                  <span className="cal-day-num">{format(date, 'd')}</span>
                  {hasTrades ? (
                    <div className="cal-cell-body">
                      <span className={`cal-pnl ${status}`}>
                        {dData!.pnl > 0 ? '+' : ''}{formatCurrency(dData!.pnl)}
                      </span>
                      <span className="cal-trades">{dData!.trades}t</span>
                    </div>
                  ) : (
                    <span className="cal-no-trade">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <div className="legend-item"><div className="legend-dot profit" />Profit</div>
        <div className="legend-item"><div className="legend-dot loss" />Loss</div>
        <div className="legend-item"><div className="legend-dot breakeven" />Breakeven</div>
        <div className="legend-item"><div className="legend-dot none" />No trades</div>
      </div>

      <style jsx>{`
        .monthly-cal { overflow: hidden; }

        /* Top header */
        .cal-top {
          padding: 16px 18px;
          border-bottom: 1px solid var(--color-border-subtle);
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .cal-month-label {
          font-size: 0.9375rem; font-weight: 700;
          color: var(--color-foreground); letter-spacing: -0.02em;
        }
        .cal-subtitle { font-size: 0.6875rem; color: var(--color-placeholder); margin-top: 2px; }

        .cal-summary-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .cal-stat { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
        .cal-stat-val { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.03em; color: var(--color-foreground); }
        .cal-stat-label { font-size: 0.5625rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-placeholder); }
        .cal-divider-v { width: 1px; height: 28px; background: var(--color-border); }

        /* Scrollable container - horizontal scroll on mobile */
        .cal-scroll-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .cal-grid-wrap {
          min-width: 560px; /* prevents collapsing below this */
          padding: 12px 16px;
        }

        /* Day name row */
        .cal-header-row {
          display: grid; grid-template-columns: repeat(7, 1fr);
          margin-bottom: 2px;
        }
        .cal-day-name {
          text-align: center; padding: 6px 0;
          font-size: 0.625rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--color-placeholder);
        }

        /* Days grid */
        .cal-days-grid {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 3px;
        }

        .cal-cell {
          min-height: 70px; border-radius: 5px;
          padding: 7px 8px; display: flex; flex-direction: column;
          border: 1px solid transparent;
          transition: border-color 0.12s;
          cursor: default; position: relative;
        }
        .cal-cell:not(.empty):not(.none) { cursor: pointer; }
        .cal-cell:hover:not(.empty):not(.none) { border-color: var(--color-border); }

        .cal-cell.empty { background: transparent; border: none; cursor: default; }
        .cal-cell.none {
          background: var(--color-border-subtle);
          border-color: transparent;
        }
        .cal-cell.profit {
          background: rgba(34,197,94,0.07);
          border-color: rgba(34,197,94,0.15);
        }
        .cal-cell.loss {
          background: rgba(239,68,68,0.07);
          border-color: rgba(239,68,68,0.15);
        }
        .cal-cell.breakeven {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.15);
        }

        .cal-day-num {
          font-size: 0.6875rem; font-weight: 600;
          color: var(--color-muted-foreground);
          display: block; margin-bottom: 2px;
        }

        .cal-cell-body {
          display: flex; flex-direction: column;
          margin-top: auto; gap: 1px;
        }
        .cal-pnl {
          font-size: 0.625rem; font-weight: 700;
          line-height: 1.2; display: block;
          font-variant-numeric: tabular-nums;
        }
        .cal-pnl.profit { color: var(--color-success); }
        .cal-pnl.loss { color: var(--color-loss); }
        .cal-pnl.breakeven { color: var(--color-warning); }
        .cal-trades {
          font-size: 0.5rem; color: var(--color-placeholder);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .cal-no-trade {
          font-size: 0.5625rem; color: var(--color-placeholder);
          margin-top: auto; opacity: 0.4;
        }

        /* Legend */
        .cal-legend {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          padding: 10px 18px;
          border-top: 1px solid var(--color-border-subtle);
        }
        .legend-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.6875rem; color: var(--color-muted-foreground);
        }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
        .legend-dot.profit  { background: rgba(34,197,94,0.5); }
        .legend-dot.loss    { background: rgba(239,68,68,0.5); }
        .legend-dot.breakeven { background: rgba(245,158,11,0.4); }
        .legend-dot.none    { background: var(--color-border); }
      `}</style>
    </div>
  );
}
