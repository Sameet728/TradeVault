'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';

export default function StrategyBuilderPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<any[]>([]);

  const addParameter = (type: string) => {
    setParameters([
      ...parameters,
      {
        id: Date.now().toString(),
        key: `param_${Date.now()}`,
        label: 'New Parameter',
        type,
        required: false,
        options: type === 'select' || type === 'multiselect' ? ['Option 1'] : []
      }
    ]);
  };

  const updateParameter = (id: string, field: string, value: any) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeParameter = (id: string) => {
    setParameters(parameters.filter(p => p.id !== id));
  };

  const saveStrategy = async () => {
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, parameters })
      });
      if (res.ok) {
        alert('Strategy saved successfully!');
        window.location.href = '/dashboard';
      } else {
        alert('Failed to save strategy.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="builder-container">
      <PageHeader 
        title="Dynamic Strategy Builder" 
        description="Create your ultimate trading blueprint with dynamic parameters." 
      />

      <div className="builder-content">
        <div className="card">
          <div className="card-header">
            <h3>Strategy Details</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Strategy Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Liquidity Sweep" 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                className="input-field" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe your strategy's core concept..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header flex-between">
            <h3>Dynamic Parameters</h3>
            <div className="param-types">
              <select className="input-field-sm" id="paramSelect">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi-Select</option>
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="image">Image Upload</option>
              </select>
              <Button 
                variant="outline" 
                onClick={() => {
                  const sel = document.getElementById('paramSelect') as HTMLSelectElement;
                  addParameter(sel.value);
                }}
              >
                + Add Parameter
              </Button>
            </div>
          </div>
          <div className="card-body">
            {parameters.length === 0 ? (
              <div className="empty-state">
                <p>No parameters added yet. Add parameters to track dynamic variables on your trades.</p>
              </div>
            ) : (
              <div className="params-list">
                {parameters.map((p, idx) => (
                  <div key={p.id} className="param-item">
                    <div className="param-header">
                      <span className="param-badge">{p.type.toUpperCase()}</span>
                      <button className="text-danger" onClick={() => removeParameter(p.id)}>Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label>Label</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={p.label} 
                          onChange={(e) => updateParameter(p.id, 'label', e.target.value)}
                        />
                      </div>
                      <div className="form-group flex-1">
                        <label>Database Key</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={p.key} 
                          onChange={(e) => updateParameter(p.id, 'key', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        />
                      </div>
                    </div>
                    {(p.type === 'select' || p.type === 'multiselect') && (
                      <div className="form-group">
                        <label>Options (comma separated)</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={p.options.join(', ')} 
                          onChange={(e) => updateParameter(p.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="actions-bar mt-6">
          <Button variant="primary" onClick={saveStrategy} disabled={!name}>
            Save Strategy v1.0
          </Button>
        </div>
      </div>

      <style jsx>{`
        .builder-container { max-width: 800px; margin: 0 auto; padding-bottom: 60px; }
        .builder-content { margin-top: 24px; }
        .mt-4 { margin-top: 16px; }
        .mt-6 { margin-top: 24px; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .param-types { display: flex; gap: 8px; }
        .input-field-sm { 
          background: var(--color-background); border: 1px solid var(--color-border);
          color: var(--color-foreground); border-radius: 6px; padding: 4px 8px; font-size: 0.8125rem;
        }
        .empty-state { text-align: center; padding: 40px 20px; color: var(--color-placeholder); font-size: 0.875rem; }
        .params-list { display: flex; flex-direction: column; gap: 16px; }
        .param-item { 
          background: var(--color-background); border: 1px solid var(--color-border-subtle); 
          border-radius: 8px; padding: 16px; 
        }
        .param-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .param-badge { 
          font-size: 0.625rem; background: var(--color-border); padding: 2px 6px; 
          border-radius: 4px; font-weight: 600; color: var(--color-muted-foreground);
        }
        .text-danger { color: var(--color-loss); background: none; border: none; font-size: 0.75rem; cursor: pointer; }
        .form-row { display: flex; gap: 12px; }
        .flex-1 { flex: 1; }
        .actions-bar { display: flex; justify-content: flex-end; }
      `}</style>
    </div>
  );
}
