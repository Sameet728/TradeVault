'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function ParameterAnalytics({ strategyId }: { strategyId: string }) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategyId);
  const [parameters, setParameters] = useState<any[]>([]);
  const [selectedParamKey, setSelectedParamKey] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/strategies')
      .then(res => res.json())
      .then(d => {
        setStrategies(d.strategies || []);
        if (!selectedStrategyId && d.strategies?.length > 0) {
          setSelectedStrategyId(d.strategies[0]._id);
        }
      });
  }, []);

  useEffect(() => {
    const strat = strategies.find(s => s._id === selectedStrategyId);
    if (strat && strat.parameters) {
      setParameters(strat.parameters);
      if (strat.parameters.length > 0) {
        setSelectedParamKey(strat.parameters[0].key);
      } else {
        setSelectedParamKey('');
        setData([]);
      }
    }
  }, [selectedStrategyId, strategies]);

  useEffect(() => {
    if (!selectedStrategyId || !selectedParamKey) return;
    setLoading(true);
    fetch(`/api/analytics/parameters?strategyId=${selectedStrategyId}&parameterKey=${selectedParamKey}`)
      .then(res => res.json())
      .then(d => {
        setData(d.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedStrategyId, selectedParamKey]);

  return (
    <div className="card">
      <div className="card-header flex-between">
        <div>
          <h3>Dynamic Parameter Engine</h3>
          <span className="subtitle">Analyze edge across custom variables</span>
        </div>
        <div className="filters">
          <select 
            className="input-field-sm" 
            value={selectedStrategyId} 
            onChange={e => setSelectedStrategyId(e.target.value)}
          >
            {strategies.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          {parameters.length > 0 && (
            <select 
              className="input-field-sm ml-2" 
              value={selectedParamKey} 
              onChange={e => setSelectedParamKey(e.target.value)}
            >
              {parameters.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          )}
        </div>
      </div>
      
      <div className="card-body">
        {loading ? (
          <div className="skeleton" style={{ height: '220px', borderRadius: '4px' }} />
        ) : data.length === 0 ? (
          <div className="empty-state">No trades logged with this parameter yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C1C1C" />
              <XAxis dataKey="parameterValue" tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: '#0A0A0A', border: '1px solid #262626', borderRadius: '6px' }}
                formatter={(val: any, name: any) => [
                  name === 'totalPnL' ? formatCurrency(val) : name === 'winRate' ? `${Number(val).toFixed(1)}%` : val, 
                  name === 'totalPnL' ? 'Net Profit' : name === 'winRate' ? 'Win Rate' : 'Trades'
                ]}
              />
              <Bar dataKey="totalPnL" name="totalPnL" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.totalPnL >= 0 ? '#22C55E' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style jsx>{`
        .card { padding: 0; }
        .card-header { padding: 16px 20px; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .card-header h3 { margin: 0; font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .subtitle { font-size: 0.75rem; color: var(--color-placeholder); }
        .card-body { padding: 10px 20px 20px; }
        .filters { display: flex; gap: 8px; }
        .input-field-sm { 
          background: var(--color-background); border: 1px solid var(--color-border);
          color: var(--color-foreground); border-radius: 6px; padding: 4px 8px; font-size: 0.8125rem;
        }
        .ml-2 { margin-left: 8px; }
        .empty-state { text-align: center; color: var(--color-placeholder); font-size: 0.875rem; padding: 40px; }
        .skeleton { background: var(--color-surface); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
