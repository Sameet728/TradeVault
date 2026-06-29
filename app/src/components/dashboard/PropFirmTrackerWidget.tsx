'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Target, AlertTriangle, ShieldCheck } from 'lucide-react';

export function PropFirmTrackerWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prop-tracker')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="card skeleton" style={{ height: '240px' }} />;
  if (!data || !data.active) return null; // Hide if user has no active prop account

  const getStatusColor = () => {
    if (data.status === 'PASSED') return 'var(--color-success)';
    if (data.status === 'FAILED') return 'var(--color-loss)';
    return '#3b82f6';
  };

  return (
    <div className="card prop-firm-widget" style={{ borderColor: getStatusColor() }}>
      <div className="card-header flex-between">
        <div className="flex align-center gap-2">
          {data.status === 'PASSED' ? <ShieldCheck size={18} color="var(--color-success)"/> : 
           data.status === 'FAILED' ? <AlertTriangle size={18} color="var(--color-loss)"/> :
           <Target size={18} color="#3b82f6" />}
          <h3>{data.accountName} (Prop Tracker)</h3>
        </div>
        <span className="badge" style={{ background: `${getStatusColor()}20`, color: getStatusColor() }}>
          {data.status}
        </span>
      </div>
      <div className="card-body">
        <div className="metrics-grid">
          <div className="metric-box">
            <span className="label">Profit Target ({data.metrics.profitTarget}%)</span>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill success" style={{ width: `${data.progress.profit.achieved}%` }} />
            </div>
            <div className="flex-between mt-1">
              <span className="val">{formatCurrency(Math.max(data.metrics.totalPnL, 0))}</span>
              <span className="target">{formatCurrency(data.metrics.profitTargetAmount)}</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="label">Daily Loss Limit ({data.metrics.dailyDrawdownLimit}%)</span>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${data.progress.daily.failed ? 'danger' : 'warning'}`} 
                style={{ width: `${data.progress.daily.used}%` }} 
              />
            </div>
            <div className="flex-between mt-1">
              <span className="val text-danger">{formatCurrency(Math.min(data.metrics.dailyPnL, 0))}</span>
              <span className="target">-{formatCurrency(data.metrics.dailyDrawdownAmount)}</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="label">Max Drawdown ({data.metrics.maxDrawdownLimit}%)</span>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${data.progress.max.failed ? 'danger' : 'warning'}`} 
                style={{ width: `${data.progress.max.used}%` }} 
              />
            </div>
            <div className="flex-between mt-1">
              <span className="val text-danger">{formatCurrency(Math.min(data.metrics.totalPnL, 0))}</span>
              <span className="target">-{formatCurrency(data.metrics.maxDrawdownAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .prop-firm-widget { padding: 0; background: linear-gradient(180deg, rgba(30,30,30,0) 0%, rgba(10,10,10,0.5) 100%); }
        .card-header { padding: 16px 20px 12px; border-bottom: 1px solid var(--color-border-subtle); }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .flex { display: flex; }
        .align-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .mt-1 { margin-top: 4px; }
        .card-header h3 { margin: 0; font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .badge { padding: 2px 8px; border-radius: 4px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; }
        
        .card-body { padding: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 768px) { .metrics-grid { grid-template-columns: 1fr; gap: 16px; } }
        
        .metric-box { display: flex; flex-direction: column; }
        .label { font-size: 0.6875rem; color: var(--color-placeholder); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 600; }
        .progress-bar-bg { width: 100%; height: 6px; background: var(--color-border-subtle); border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
        .progress-bar-fill.success { background: var(--color-success); }
        .progress-bar-fill.warning { background: #f59e0b; }
        .progress-bar-fill.danger { background: var(--color-loss); }
        
        .val { font-size: 0.8125rem; font-weight: 700; color: var(--color-foreground); }
        .target { font-size: 0.6875rem; color: var(--color-muted-foreground); }
        .text-danger { color: var(--color-loss); }
        
        .skeleton { background: var(--color-surface); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
