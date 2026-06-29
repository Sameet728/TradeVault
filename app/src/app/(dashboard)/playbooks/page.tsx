'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');
  
  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playbooks');
      const data = await res.json();
      setPlaybooks(data.playbooks || []);
    } finally {
      setLoading(false);
    }
  };

  const savePlaybook = async () => {
    try {
      const criteriaList = criteria.split('\\n').filter(c => c.trim());
      const res = await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, criteria: criteriaList })
      });
      if (res.ok) {
        setIsAdding(false);
        setName('');
        setDescription('');
        setCriteria('');
        fetchPlaybooks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="The Playbook" 
        description="Document your A+ setups with strict criteria and visual examples." 
        actions={
          <Button variant="primary" onClick={() => setIsAdding(true)}>
            + Add Playbook
          </Button>
        }
      />

      {isAdding && (
        <div className="card mb-6">
          <div className="card-header">
            <h3>New Setup Playbook</h3>
          </div>
          <div className="card-body">
            <div className="form-group mb-4">
              <label>Setup Name</label>
              <input 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. A+ Liquidity Sweep" 
              />
            </div>
            <div className="form-group mb-4">
              <label>Description</label>
              <textarea 
                className="input-field" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Explain the logic behind this setup..."
                rows={3}
              />
            </div>
            <div className="form-group mb-4">
              <label>Criteria Checklist (one per line)</label>
              <textarea 
                className="input-field" 
                value={criteria} 
                onChange={(e) => setCriteria(e.target.value)} 
                placeholder="15m BOS\\nLondon Session\\nRR > 2"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button variant="primary" onClick={savePlaybook} disabled={!name}>Save Playbook</Button>
            </div>
          </div>
        </div>
      )}

      <div className="playbooks-grid">
        {loading ? (
          <div className="skeleton card" style={{ height: 200 }} />
        ) : playbooks.length === 0 && !isAdding ? (
          <div className="empty-state card">
            <p>You haven't documented any setups yet. A professional trader relies on a defined playbook.</p>
            <Button variant="primary" onClick={() => setIsAdding(true)} className="mt-4">+ Create Playbook</Button>
          </div>
        ) : (
          playbooks.map(pb => (
            <div key={pb._id} className="card playbook-card">
              <div className="pb-header">
                <h3>{pb.name}</h3>
                <span className="badge">{pb.criteria.length} Rules</span>
              </div>
              <p className="pb-desc">{pb.description}</p>
              <div className="pb-criteria">
                <h4>Checklist</h4>
                <ul>
                  {pb.criteria.map((c: string, i: number) => (
                    <li key={i}>
                      <span className="checkbox"></span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-4 { margin-top: 16px; }
        .flex { display: flex; }
        .gap-2 { gap: 8px; }
        .justify-end { justify-content: flex-end; }
        .empty-state { text-align: center; padding: 60px 20px; color: var(--color-placeholder); }
        .playbooks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .playbook-card { display: flex; flex-direction: column; }
        .pb-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .pb-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: var(--color-foreground); }
        .badge { background: var(--color-border); padding: 2px 8px; border-radius: 12px; font-size: 0.6875rem; font-weight: 600; }
        .pb-desc { font-size: 0.8125rem; color: var(--color-muted-foreground); margin-bottom: 16px; line-height: 1.5; }
        .pb-criteria { background: var(--color-background); border: 1px solid var(--color-border-subtle); border-radius: 6px; padding: 12px; flex: 1; }
        .pb-criteria h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-placeholder); margin: 0 0 10px 0; }
        .pb-criteria ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .pb-criteria li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.8125rem; color: var(--color-foreground); }
        .checkbox { width: 14px; height: 14px; border: 1px solid var(--color-border); border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
        .skeleton { animation: pulse 2s infinite; background: var(--color-surface); }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
