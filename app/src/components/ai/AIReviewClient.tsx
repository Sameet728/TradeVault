'use client';

import { useState, useTransition } from 'react';
import { generateTradeReviewAction } from '@/actions/ai.actions';
import { toast } from 'sonner';
import type { Trade } from '@/types/trade.types';
import type { AIReview } from '@/types/ai.types';
import { EmptyState } from '@/components/shared/EmptyState';
import { BrainCircuit, Star, TrendingUp, TrendingDown, AlertTriangle, Zap, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AIReviewClientProps {
  trades: Trade[];
}

export function AIReviewClient({ trades }: AIReviewClientProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [review, setReview] = useState<AIReview | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!selectedTrade) return;
    startTransition(async () => {
      const result = await generateTradeReviewAction(selectedTrade._id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.review) {
        setReview(result.review);
        toast.success('AI review generated!');
      }
    });
  }

  if (trades.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<BrainCircuit size={20} />}
          title="No closed trades yet"
          description="Close some trades to unlock AI-powered trade reviews."
        />
      </div>
    );
  }

  return (
    <div className="review-layout">
      {/* Trade Selector */}
      <div className="selector-card card">
        <h3 className="selector-title">Select a Trade to Review</h3>
        <div className="trade-list">
          {trades.map((trade) => (
            <button
              key={trade._id}
              className={`trade-item ${selectedTrade?._id === trade._id ? 'active' : ''}`}
              onClick={() => { setSelectedTrade(trade); setReview(null); }}
            >
              <div className="trade-item-left">
                <span className="trade-item-symbol">{trade.symbol}</span>
                <span className={`badge ${trade.direction === 'LONG' ? 'badge-success' : 'badge-loss'}`} style={{ fontSize: '0.6875rem' }}>
                  {trade.direction}
                </span>
              </div>
              <div className="trade-item-right">
                {trade.pnl !== undefined && (
                  <span style={{ color: trade.pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.875rem' }}>
                    {formatCurrency(trade.pnl, 'USD', true)}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-placeholder)' }}>{formatDate(trade.tradeDate, 'MMM dd')}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedTrade && !review && (
          <button
            id="btn-generate-ai-review"
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isPending}
          >
            {isPending ? (
              <><span className="spinner" /> Analyzing with Gemini...</>
            ) : (
              <><BrainCircuit size={15} /> Generate AI Review</>
            )}
          </button>
        )}
      </div>

      {/* Review Result */}
      {review && (
        <div className="review-result animate-fade-in">
          {/* Score */}
          <div className="score-card card">
            <div className="score-circle" style={{
              background: `conic-gradient(${review.score >= 70 ? '#22c55e' : review.score >= 40 ? '#f59e0b' : '#ef4444'} ${review.score * 3.6}deg, var(--color-border-subtle) 0deg)`
            }}>
              <div className="score-inner">
                <span className="score-num">{review.score}</span>
                <span className="score-label">/ 100</span>
              </div>
            </div>
            <div className="score-meta">
              <h3 className="score-title">Trade Score</h3>
              <p className="score-summary">{review.summary}</p>
              <button
                className="btn-regen"
                onClick={handleGenerate}
                disabled={isPending}
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Insights Grid */}
          <div className="insights-grid">
            <InsightSection
              icon={<TrendingUp size={15} color="#22c55e" />}
              title="Strengths"
              items={review.strengths}
              color="#22c55e"
            />
            <InsightSection
              icon={<TrendingDown size={15} color="#ef4444" />}
              title="Weaknesses"
              items={review.weaknesses}
              color="#ef4444"
            />
            {review.mistakes.length > 0 && (
              <InsightSection
                icon={<AlertTriangle size={15} color="#f59e0b" />}
                title="Mistakes"
                items={review.mistakes}
                color="#f59e0b"
              />
            )}
            <InsightSection
              icon={<Zap size={15} color="#3b82f6" />}
              title="Improvements"
              items={review.improvements}
              color="#3b82f6"
            />
          </div>
        </div>
      )}

      {!selectedTrade && !review && (
        <div className="card select-prompt">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', color: 'var(--color-placeholder)', textAlign: 'center' }}>
            <BrainCircuit size={32} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Select a trade on the left to generate an AI review</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .review-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        @media (max-width: 900px) { .review-layout { grid-template-columns: 1fr; } }
        .selector-card { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 70vh; }
        .selector-title { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .trade-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .trade-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 8px;
          background: none; border: 1px solid transparent;
          cursor: pointer; transition: all 0.12s; font-family: inherit; width: 100%;
        }
        .trade-item:hover { background: rgba(255,255,255,0.03); border-color: var(--color-border); }
        .trade-item.active { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.2); }
        .trade-item-left { display: flex; align-items: center; gap: 8px; }
        .trade-item-symbol { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .trade-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .btn-generate {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px; background: #3b82f6; border: none; border-radius: 8px;
          color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: background 0.15s; font-family: inherit;
        }
        .btn-generate:hover { background: #2563eb; }
        .btn-generate:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .review-result { display: flex; flex-direction: column; gap: 16px; }
        .score-card { padding: 20px; display: flex; align-items: flex-start; gap: 20px; }
        .score-circle {
          width: 80px; height: 80px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .score-inner {
          width: 64px; height: 64px; background: var(--color-card); border-radius: 50%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .score-num { font-size: 1.25rem; font-weight: 700; color: var(--color-foreground); line-height: 1; }
        .score-label { font-size: 0.625rem; color: #71717a; }
        .score-meta { flex: 1; }
        .score-title { font-size: 1rem; font-weight: 700; color: var(--color-foreground); margin: 0 0 8px; }
        .score-summary { font-size: 0.875rem; color: var(--color-muted-foreground); line-height: 1.5; margin: 0 0 12px; }
        .btn-regen { font-size: 0.8125rem; color: #3b82f6; background: none; border: none; cursor: pointer; padding: 0; font-family: inherit; }
        .btn-regen:hover { text-decoration: underline; }
        .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 700px) { .insights-grid { grid-template-columns: 1fr; } }
        .select-prompt {}
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}

function InsightSection({
  icon, title, items, color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="insight-card card" style={{ borderLeftColor: color + '30', borderLeftWidth: 3 }}>
      <div className="insight-header">
        {icon}
        <h4 className="insight-title">{title}</h4>
      </div>
      <ul className="insight-list">
        {items.map((item, i) => (
          <li key={i} className="insight-item">{item}</li>
        ))}
      </ul>
      <style jsx>{`
        .insight-card { padding: 16px; border-left: 3px solid transparent; }
        .insight-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .insight-title { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .insight-list { margin: 0; padding: 0 0 0 16px; display: flex; flex-direction: column; gap: 6px; }
        .insight-item { font-size: 0.8125rem; color: var(--color-muted-foreground); line-height: 1.4; }
      `}</style>
    </div>
  );
}
