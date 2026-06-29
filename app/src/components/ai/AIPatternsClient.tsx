'use client';

import { useState, useTransition } from 'react';
import { generatePatternDiscoveryAction } from '@/actions/ai.actions';
import { toast } from 'sonner';
import type { AIPatternDiscovery, AIPatternInsight } from '@/types/ai.types';
import { TrendingUp, AlertTriangle, Star, Zap, Target, BrainCircuit } from 'lucide-react';

const CONFIDENCE_COLORS = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#71717a',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Best Session': <Target size={15} color="#22c55e" />,
  'Worst Session': <AlertTriangle size={15} color="#ef4444" />,
  'Best Symbol': <TrendingUp size={15} color="#22c55e" />,
  'Worst Symbol': <AlertTriangle size={15} color="#ef4444" />,
  'Optimal Parameter': <Star size={15} color="#f59e0b" />,
  'Avoid Parameter': <AlertTriangle size={15} color="#ef4444" />,
  'Edge Pattern': <Zap size={15} color="#3b82f6" />,
  'Risk Warning': <AlertTriangle size={15} color="#f59e0b" />,
};

export function AIPatternsClient() {
  const [discovery, setDiscovery] = useState<AIPatternDiscovery | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDiscover() {
    startTransition(async () => {
      const result = await generatePatternDiscoveryAction();
      if (result.error) {
        toast.error(result.error);
      } else if (result.discovery) {
        setDiscovery(result.discovery);
        toast.success('Pattern analysis complete!');
      }
    });
  }

  return (
    <div className="patterns-layout">
      {!discovery ? (
        <div className="card generate-card">
          <div className="generate-icon">
            <BrainCircuit size={28} color="#3b82f6" />
          </div>
          <h3 className="generate-title">Discover Your Edge</h3>
          <p className="generate-desc">
            Our AI will analyze your trade history and identify patterns across sessions,
            symbols, and strategy parameters to help you find your statistical edge.
            Requires at least 20 closed trades.
          </p>
          <button
            id="btn-discover-patterns"
            className="btn-discover"
            onClick={handleDiscover}
            disabled={isPending}
          >
            {isPending ? (
              <><span className="spinner" /> Analyzing patterns...</>
            ) : (
              <><BrainCircuit size={15} /> Discover My Edge</>
            )}
          </button>
        </div>
      ) : (
        <div className="discovery-result animate-fade-in">
          <div className="discovery-meta">
            <span className="meta-badge">{discovery.tradesSampled} trades analyzed</span>
            <span className="meta-badge">{discovery.insights.length} insights found</span>
            <button className="btn-regen" onClick={handleDiscover} disabled={isPending}>
              {isPending ? 'Analyzing...' : 'Re-analyze'}
            </button>
          </div>

          <div className="insights-grid">
            {discovery.insights.map((insight, i) => (
              <PatternCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .patterns-layout {}
        .generate-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 16px; padding: 48px; text-align: center; max-width: 520px; margin: 0 auto;
        }
        .generate-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .generate-title { font-size: 1.125rem; font-weight: 700; color: var(--color-foreground); margin: 0; }
        .generate-desc { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.6; margin: 0; }
        .btn-discover {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; background: #3b82f6; border: none; border-radius: 8px;
          color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: background 0.15s; font-family: inherit;
        }
        .btn-discover:hover { background: #2563eb; }
        .btn-discover:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .discovery-result { display: flex; flex-direction: column; gap: 20px; }
        .discovery-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .meta-badge {
          padding: 4px 12px; border-radius: 99px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15);
          font-size: 0.8125rem; color: #3b82f6; font-weight: 500;
        }
        .btn-regen {
          margin-left: auto; font-size: 0.8125rem; color: #71717a;
          background: none; border: 1px solid var(--color-border); border-radius: 8px;
          padding: 5px 12px; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .btn-regen:hover { color: var(--color-foreground); border-color: #3f3f46; }
        .btn-regen:disabled { opacity: 0.5; cursor: not-allowed; }
        .insights-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}

function PatternCard({ insight }: { insight: AIPatternInsight }) {
  const confidenceColor = CONFIDENCE_COLORS[insight.confidence];
  const icon = CATEGORY_ICONS[insight.category] ?? <Zap size={15} color="#3b82f6" />;

  return (
    <div className="pattern-card card">
      <div className="card-header">
        <div className="category-icon">{icon}</div>
        <span className="category-label">{insight.category}</span>
        <span className="confidence-dot" style={{ background: confidenceColor }} title={`${insight.confidence} confidence`} />
      </div>
      <p className="insight-text">{insight.insight}</p>
      <div className="supporting-data">
        <span className="data-label">Data:</span>
        <span className="data-value">{insight.supportingData}</span>
      </div>
      <div className="actionable">
        <Zap size={12} color="#3b82f6" />
        <span>{insight.actionable}</span>
      </div>

      <style jsx>{`
        .pattern-card { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
        .card-header { display: flex; align-items: center; gap: 8px; }
        .category-icon { display: flex; }
        .category-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-muted-foreground); }
        .confidence-dot { width: 7px; height: 7px; border-radius: 50%; margin-left: auto; }
        .insight-text { font-size: 0.9375rem; font-weight: 500; color: var(--color-foreground); line-height: 1.4; margin: 0; }
        .supporting-data { display: flex; gap: 6px; font-size: 0.75rem; }
        .data-label { color: var(--color-placeholder); font-weight: 500; }
        .data-value { color: var(--color-muted-foreground); }
        .actionable {
          display: flex; align-items: flex-start; gap: 6px;
          padding: 8px 10px;
          background: rgba(59,130,246,0.06);
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 8px;
          font-size: 0.8125rem; color: var(--color-muted-foreground); line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
