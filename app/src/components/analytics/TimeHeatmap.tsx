'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TimeHeatmap() {
  const [grid, setGrid] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/heatmaps')
      .then(res => res.json())
      .then(data => {
        setGrid(data.heatmap || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getHeatmapColor = (pnl: number, count: number) => {
    if (count === 0) return 'var(--color-surface)';
    if (pnl > 0) return `rgba(34, 197, 94, ${Math.min(0.2 + (pnl / 1000), 1)})`; // Green
    if (pnl < 0) return `rgba(239, 68, 68, ${Math.min(0.2 + (Math.abs(pnl) / 1000), 1)})`; // Red
    return 'var(--color-border-subtle)';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Time & Session Heatmap</h3>
        <span className="subtitle">Discover your most profitable trading windows (Local Time)</span>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 4 }} />
        ) : grid.length === 0 ? (
          <div className="empty-state">No heatmap data available.</div>
        ) : (
          <div className="heatmap-container">
            <div className="heatmap-grid">
              {/* Top header row for hours */}
              <div className="cell header-cell corner"></div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="cell header-cell">{h}</div>
              ))}

              {/* Grid rows */}
              {grid.map((dayData, dIdx) => (
                <div key={dIdx} className="heatmap-row">
                  <div className="cell header-cell day-label">{days[dIdx]}</div>
                  {dayData.map((hourData: any, hIdx: number) => (
                    <div 
                      key={hIdx} 
                      className="cell data-cell"
                      style={{ background: getHeatmapColor(hourData.totalPnL, hourData.tradeCount) }}
                      title={`${days[dIdx]} ${hIdx}:00\\nTrades: ${hourData.tradeCount}\\nPnL: ${formatCurrency(hourData.totalPnL)}\\nWin Rate: ${hourData.winRate.toFixed(1)}%`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="legend mt-4">
              <span className="legend-item"><div className="color-box" style={{ background: 'rgba(239, 68, 68, 0.8)' }}/> Heavy Loss</span>
              <span className="legend-item"><div className="color-box" style={{ background: 'rgba(239, 68, 68, 0.3)' }}/> Slight Loss</span>
              <span className="legend-item"><div className="color-box" style={{ background: 'var(--color-surface)' }}/> No Trades</span>
              <span className="legend-item"><div className="color-box" style={{ background: 'rgba(34, 197, 94, 0.3)' }}/> Slight Profit</span>
              <span className="legend-item"><div className="color-box" style={{ background: 'rgba(34, 197, 94, 0.8)' }}/> Heavy Profit</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .card { padding: 0; }
        .card-header { padding: 16px 20px; border-bottom: 1px solid var(--color-border-subtle); }
        .card-header h3 { margin: 0; font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .subtitle { font-size: 0.75rem; color: var(--color-placeholder); }
        .card-body { padding: 20px; overflow-x: auto; }
        
        .heatmap-container { min-width: 700px; }
        .heatmap-row { display: flex; }
        .cell { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 0.6875rem; }
        .header-cell { color: var(--color-placeholder); font-weight: 500; }
        .day-label { width: 40px; justify-content: flex-start; }
        .corner { width: 40px; }
        .data-cell { 
          margin: 2px; border-radius: 4px; cursor: pointer; transition: transform 0.1s; border: 1px solid rgba(255,255,255,0.05);
        }
        .data-cell:hover { transform: scale(1.15); z-index: 10; border-color: var(--color-foreground); }
        
        .legend { display: flex; gap: 16px; justify-content: center; font-size: 0.6875rem; color: var(--color-muted-foreground); }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .color-box { width: 12px; height: 12px; border-radius: 2px; }
        .mt-4 { margin-top: 16px; }

        .empty-state { text-align: center; color: var(--color-placeholder); font-size: 0.875rem; padding: 40px; }
        .skeleton { background: var(--color-surface); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
