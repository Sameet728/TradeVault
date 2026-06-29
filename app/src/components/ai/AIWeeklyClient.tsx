'use client';

import { useState, useTransition } from 'react';
import { generateWeeklyReportAction } from '@/actions/ai.actions';
import { toast } from 'sonner';
import type { AIWeeklyReport } from '@/types/ai.types';
import { BookOpen, CheckCircle2, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export function AIWeeklyClient() {
  const [report, setReport] = useState<AIWeeklyReport | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateWeeklyReportAction();
      if (result.error) {
        toast.error(result.error);
      } else if (result.report) {
        setReport(result.report);
        toast.success('Weekly report generated!');
      }
    });
  }

  return (
    <div className="weekly-layout">
      {!report ? (
        <div className="generate-card card">
          <div className="generate-icon">
            <BookOpen size={28} color="#3b82f6" />
          </div>
          <h3 className="generate-title">Generate This Week&apos;s Report</h3>
          <p className="generate-desc">
            Our AI will analyze all your trades from this week and generate a comprehensive
            performance report with insights, patterns, and actionable recommendations.
          </p>
          <button
            id="btn-generate-weekly"
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isPending}
          >
            {isPending ? (
              <><span className="spinner" /> Generating Report...</>
            ) : (
              <><BookOpen size={15} /> Generate Weekly Report</>
            )}
          </button>
        </div>
      ) : (
        <div className="report-content animate-fade-in">
          {/* Header Stats */}
          <div className="report-stats">
            <div className="stat-pill card">
              <span className="stat-pill-label">Total Trades</span>
              <span className="stat-pill-value">{report.tradeCount}</span>
            </div>
            <div className="stat-pill card">
              <span className="stat-pill-label">Win Rate</span>
              <span className="stat-pill-value" style={{ color: report.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                {report.winRate.toFixed(1)}%
              </span>
            </div>
            <div className="stat-pill card">
              <span className="stat-pill-label">Net PnL</span>
              <span className="stat-pill-value" style={{ color: report.netPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatCurrency(report.netPnl, 'USD', true)}
              </span>
            </div>
            <div className="stat-pill card">
              <span className="stat-pill-label">Best Strategy</span>
              <span className="stat-pill-value" style={{ fontSize: '0.9rem' }}>{report.bestStrategy}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="card summary-card">
            <div className="section-head">
              <TrendingUp size={15} color="#3b82f6" />
              <h3 className="section-title">Weekly Summary</h3>
              <span className="week-range">
                {formatDate(report.weekStart, 'MMM dd')} — {formatDate(report.weekEnd, 'MMM dd, yyyy')}
              </span>
            </div>
            <p className="summary-text">{report.summary}</p>
          </div>

          {/* Mistakes + Improvements */}
          <div className="two-col">
            <div className="card">
              <div className="section-head">
                <AlertTriangle size={15} color="#f59e0b" />
                <h3 className="section-title">Common Mistakes</h3>
              </div>
              <ul className="insight-list warning">
                {report.commonMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div className="section-head">
                <Lightbulb size={15} color="#22c55e" />
                <h3 className="section-title">Suggested Improvements</h3>
              </div>
              <ul className="insight-list success">
                {report.suggestedImprovements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <button className="btn-regen" onClick={handleGenerate} disabled={isPending}>
            {isPending ? 'Regenerating...' : 'Regenerate Report'}
          </button>
        </div>
      )}

      <style jsx>{`
        .weekly-layout {}
        .generate-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 16px; padding: 48px; text-align: center; max-width: 480px; margin: 0 auto;
        }
        .generate-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .generate-title { font-size: 1.125rem; font-weight: 700; color: var(--color-foreground); margin: 0; }
        .generate-desc { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.6; margin: 0; }
        .btn-generate {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; background: #3b82f6; border: none; border-radius: 8px;
          color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: background 0.15s; font-family: inherit;
        }
        .btn-generate:hover { background: #2563eb; }
        .btn-generate:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .report-content { display: flex; flex-direction: column; gap: 20px; }
        .report-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        .stat-pill { padding: 14px 18px; display: flex; flex-direction: column; gap: 4px; }
        .stat-pill-label { font-size: 0.75rem; color: #71717a; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
        .stat-pill-value { font-size: 1.25rem; font-weight: 700; color: var(--color-foreground); letter-spacing: -0.02em; }
        .summary-card { padding: 20px; }
        .section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .section-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .week-range { margin-left: auto; font-size: 0.75rem; color: #71717a; }
        .summary-text { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.7; margin: 0; white-space: pre-wrap; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
        .two-col .card { padding: 20px; }
        .insight-list { margin: 0; padding: 0 0 0 16px; display: flex; flex-direction: column; gap: 8px; }
        .insight-list li { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.4; }
        .insight-list.warning li::marker { color: #f59e0b; }
        .insight-list.success li::marker { color: #22c55e; }
        .btn-regen {
          align-self: flex-start; font-size: 0.8125rem; color: #71717a;
          background: none; border: 1px solid var(--color-border); border-radius: 8px;
          padding: 7px 14px; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .btn-regen:hover { color: var(--color-foreground); border-color: #3f3f46; }
        .btn-regen:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}
