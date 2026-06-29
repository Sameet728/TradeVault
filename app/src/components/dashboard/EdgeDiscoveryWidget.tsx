'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export function EdgeDiscoveryWidget() {
  const [setups, setSetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/edge')
      .then(res => res.json())
      .then(d => {
        setSetups(d.bestSetups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="card skeleton" style={{ height: '300px' }} />;

  return (
    <div className="card">
      <div className="card-header">
        <h3>AI Edge Engine</h3>
        <span className="subtitle">Top performing setup combinations</span>
      </div>
      <div className="card-body">
        {setups.length === 0 ? (
          <div className="empty-state">Not enough data to discover edges (min 3 trades per setup required).</div>
        ) : (
          <div className="table-responsive">
            <table className="edge-table">
              <thead>
                <tr>
                  <th>Setup</th>
                  <th>Win Rate</th>
                  <th>PF</th>
                  <th>EV / Trade</th>
                </tr>
              </thead>
              <tbody>
                {setups.map((setup, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="setup-name">
                        <span className="badge">{setup.symbol}</span>
                        <span className="badge-outline">{setup.session}</span>
                        <span className="strategy-text">{setup.strategyName}</span>
                      </div>
                    </td>
                    <td><span className="text-success">{setup.winRate.toFixed(1)}%</span></td>
                    <td>{setup.profitFactor > 99 ? 'MAX' : setup.profitFactor.toFixed(2)}</td>
                    <td className={setup.expectedReturn >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(setup.expectedReturn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .card { padding: 0; }
        .card-header { padding: 16px 20px 8px; }
        .card-header h3 { margin: 0; font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .subtitle { font-size: 0.75rem; color: var(--color-placeholder); }
        .card-body { padding: 0; }
        .empty-state { text-align: center; color: var(--color-placeholder); font-size: 0.875rem; padding: 40px; }
        .table-responsive { width: 100%; overflow-x: auto; }
        .edge-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem; }
        .edge-table th { padding: 10px 16px; color: var(--color-placeholder); border-bottom: 1px solid var(--color-border-subtle); font-weight: 500; }
        .edge-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-foreground); }
        .edge-table tr:last-child td { border-bottom: none; }
        .setup-name { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .badge { background: var(--color-border); padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.6875rem; }
        .badge-outline { border: 1px solid var(--color-border); padding: 1px 5px; border-radius: 4px; font-weight: 600; font-size: 0.6875rem; color: var(--color-muted-foreground); }
        .strategy-text { font-weight: 500; }
        .text-success { color: var(--color-success); font-weight: 600; }
        .text-danger { color: var(--color-loss); font-weight: 600; }
        .skeleton { background: var(--color-surface); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
