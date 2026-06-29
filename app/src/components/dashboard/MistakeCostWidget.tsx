'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function MistakeCostWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/mistakes')
      .then(res => res.json())
      .then(d => {
        setData(d.mistakes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="card skeleton" style={{ height: '300px' }} />;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Mistake Cost Engine</h3>
        <span className="subtitle">Behavioral analysis of net losses</span>
      </div>
      <div className="card-body">
        {data.length === 0 ? (
          <div className="empty-state">No mistakes recorded yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1C1C1C" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fill: '#A1A1AA', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#1C1C1C' }}
                contentStyle={{ background: '#0A0A0A', border: '1px solid #262626', borderRadius: '6px' }}
                formatter={(val: any) => [formatCurrency(val), 'Cost']}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style jsx>{`
        .card { padding: 0; }
        .card-header { padding: 16px 20px 8px; }
        .card-header h3 { margin: 0; font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .subtitle { font-size: 0.75rem; color: var(--color-placeholder); }
        .card-body { padding: 10px; }
        .empty-state { text-align: center; color: var(--color-placeholder); font-size: 0.875rem; padding: 40px; }
        .skeleton { background: var(--color-surface); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
