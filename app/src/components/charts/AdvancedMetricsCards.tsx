'use client';

import React from 'react';
import type { AdvancedMetrics } from '@/types/analytics.types';

export function AdvancedMetricsCards({ metrics }: { metrics: AdvancedMetrics }) {
  if (!metrics) return null;

  return (
    <div className="advanced-metrics">
      <div className="metric-row">
        <div className="metric-col card">
          <h3 className="section-title">Total P/L</h3>
          <div className="metric-value">{metrics.longs.netPnl + metrics.shorts.netPnl < 0 ? '-' : ''}${Math.abs(metrics.longs.netPnl + metrics.shorts.netPnl).toFixed(2)}</div>
        </div>
        <div className="metric-col card">
          <h3 className="section-title">Profit Factor</h3>
          <div className="metric-value">{metrics.profitFactor}</div>
        </div>
        <div className="metric-col card">
          <h3 className="section-title">Avg Win / Loss</h3>
          <div className="metric-value">${metrics.avgWin} / ${metrics.avgLoss}</div>
        </div>
      </div>

      <div className="direction-grid">
        <div className="direction-card card">
          <h3 className="dir-title">Short Trades</h3>
          <div className="dir-stats">
            <div className="dir-stat">
              <span>Total Trades</span>
              <strong>{metrics.shorts.trades}</strong>
            </div>
            <div className="dir-stat">
              <span>Win Rate</span>
              <strong>{metrics.shorts.winRate}%</strong>
            </div>
            <div className="dir-stat">
              <span>Net Profit</span>
              <strong className={metrics.shorts.netPnl >= 0 ? 'text-green' : 'text-red'}>${metrics.shorts.netPnl}</strong>
            </div>
            <div className="dir-stat">
              <span>Largest Profit</span>
              <strong>${metrics.shorts.largestWin}</strong>
            </div>
            <div className="dir-stat">
              <span>Average Profit</span>
              <strong>${metrics.shorts.avgWin}</strong>
            </div>
            <div className="dir-stat">
              <span>Max Consecutive Wins</span>
              <strong>{metrics.shorts.maxConsecutiveWins}</strong>
            </div>
          </div>
        </div>

        <div className="direction-card card">
          <h3 className="dir-title">Long Trades</h3>
          <div className="dir-stats">
            <div className="dir-stat">
              <span>Total Trades</span>
              <strong>{metrics.longs.trades}</strong>
            </div>
            <div className="dir-stat">
              <span>Win Rate</span>
              <strong>{metrics.longs.winRate}%</strong>
            </div>
            <div className="dir-stat">
              <span>Net Profit</span>
              <strong className={metrics.longs.netPnl >= 0 ? 'text-green' : 'text-red'}>${metrics.longs.netPnl}</strong>
            </div>
            <div className="dir-stat">
              <span>Largest Profit</span>
              <strong>${metrics.longs.largestWin}</strong>
            </div>
            <div className="dir-stat">
              <span>Average Profit</span>
              <strong>${metrics.longs.avgWin}</strong>
            </div>
            <div className="dir-stat">
              <span>Max Consecutive Wins</span>
              <strong>{metrics.longs.maxConsecutiveWins}</strong>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .advanced-metrics { display: flex; flex-direction: column; gap: 20px; }
        .metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .metric-col { padding: 20px; text-align: center; }
        .metric-value { font-size: 1.5rem; font-weight: 700; margin-top: 10px; color: var(--color-foreground); }
        .section-title { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; }
        .direction-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .metric-row, .direction-grid { grid-template-columns: 1fr; }
        }
        .direction-card { padding: 20px; }
        .dir-title { font-size: 1.125rem; font-weight: 600; margin: 0 0 16px 0; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
        .dir-stats { display: flex; flex-direction: column; gap: 12px; }
        .dir-stat { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: var(--color-muted-foreground); }
        .dir-stat strong { color: var(--color-foreground); font-weight: 600; }
        .text-green { color: #22c55e !important; }
        .text-red { color: #ef4444 !important; }
      `}</style>
    </div>
  );
}
