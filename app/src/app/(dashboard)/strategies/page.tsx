import { getStrategiesAction } from '@/actions/strategy.actions';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import Link from 'next/link';
import { Plus, Zap, Edit2, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import { StrategyDeleteButton } from '@/components/strategies/StrategyDeleteButton';

export const metadata: Metadata = {
  title: 'Strategies',
  description: 'Manage your trading strategies and parameters',
};

export const dynamic = 'force-dynamic';

export default async function StrategiesPage() {
  const strategies = await getStrategiesAction();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Strategies"
        description="Build and manage your trading strategies with custom parameters"
        badge={`${strategies.length}`}
        actions={
          <Link href="/strategies/new" id="btn-new-strategy" className="btn-primary-link">
            <Plus size={14} />
            New Strategy
          </Link>
        }
      />

      {strategies.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Zap size={20} />}
            title="No strategies yet"
            description="Create your first strategy to start tracking your edge. Add custom parameters and a checklist."
            action={
              <Link href="/strategies/new" className="btn-empty">
                <Plus size={14} /> Create Strategy
              </Link>
            }
          />
        </div>
      ) : (
        <div className="strategies-grid">
          {strategies.map((strategy) => (
            <div key={strategy._id} className="strategy-card card">
              <div className="strategy-card-header">
                <div className="strategy-icon">
                  <Zap size={16} color="#3b82f6" />
                </div>
                <div className="strategy-actions-row">
                  <Link href={`/strategies/${strategy._id}`} className="icon-action" title="Edit">
                    <Edit2 size={14} />
                  </Link>
                  <StrategyDeleteButton id={strategy._id} name={strategy.name} />
                </div>
              </div>

              <h3 className="strategy-name">{strategy.name}</h3>
              {strategy.description && (
                <p className="strategy-desc">{strategy.description}</p>
              )}

              <div className="strategy-meta">
                <div className="meta-pill">
                  <span className="meta-label">Parameters</span>
                  <span className="meta-value">{strategy.parameters?.length || 0}</span>
                </div>
                <div className="meta-pill">
                  <span className="meta-label">Checklist</span>
                  <span className="meta-value">{strategy.checklist?.length || 0}</span>
                </div>
                {strategy.tradeCount !== undefined && (
                  <div className="meta-pill">
                    <span className="meta-label">Trades</span>
                    <span className="meta-value">{strategy.tradeCount}</span>
                  </div>
                )}
              </div>

              {(strategy.parameters?.length || 0) > 0 && (
                <div className="param-tags">
                  {strategy.parameters.slice(0, 4).map((p) => (
                    <span key={p.key} className="param-tag">
                      {p.label}
                      <span className="param-type">{p.type}</span>
                    </span>
                  ))}
                  {(strategy.parameters?.length || 0) > 4 && (
                    <span className="param-tag-more">+{(strategy.parameters?.length || 0) - 4} more</span>
                  )}
                </div>
              )}

              <div className="strategy-footer">
                <span className={`status-dot ${strategy.isActive ? 'active' : 'inactive'}`} />
                <span className="status-text">{strategy.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}
