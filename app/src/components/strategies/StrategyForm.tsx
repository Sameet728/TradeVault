'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createStrategyAction,
  updateStrategyAction,
} from '@/actions/strategy.actions';
import type { Strategy, StrategyParameter, ChecklistItem, StrategyFormData } from '@/types/strategy.types';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { generateId } from '@/lib/utils';

const PARAMETER_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'date', label: 'Date' },
  { value: 'rating', label: 'Rating (1–5)' },
];

interface StrategyFormProps {
  strategy?: Strategy;
}

export function StrategyForm({ strategy }: StrategyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(strategy?.name ?? '');
  const [description, setDescription] = useState(strategy?.description ?? '');
  const [isActive, setIsActive] = useState(strategy?.isActive ?? true);
  const [parameters, setParameters] = useState<StrategyParameter[]>(
    strategy?.parameters ?? []
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    strategy?.checklist ?? []
  );

  // ── Parameter helpers ──
  function addParameter() {
    setParameters((prev) => [
      ...prev,
      { key: `param_${generateId()}`, label: '', type: 'text', required: false },
    ]);
  }

  function updateParameter(index: number, updates: Partial<StrategyParameter>) {
    setParameters((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  }

  function removeParameter(index: number) {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Checklist helpers ──
  function addChecklistItem() {
    setChecklist((prev) => [
      ...prev,
      { id: generateId(), label: '', required: true },
    ]);
  }

  function updateChecklist(index: number, updates: Partial<ChecklistItem>) {
    setChecklist((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  }

  function removeChecklistItem(index: number) {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Strategy name is required');
      return;
    }

    // Auto-generate keys from labels for new params without keys
    const cleanedParams = parameters.map((p) => ({
      ...p,
      key: p.key || `param_${p.label.toLowerCase().replace(/\s+/g, '_')}`,
      label: p.label.trim(),
    })).filter((p) => p.label);

    const formData: StrategyFormData = {
      name: name.trim(),
      description: description.trim() || undefined,
      parameters: cleanedParams,
      checklist: checklist.filter((c) => c.label.trim()),
      isActive,
    };

    startTransition(async () => {
      const result = strategy
        ? await updateStrategyAction(strategy._id, formData)
        : await createStrategyAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(strategy ? 'Strategy updated!' : 'Strategy created!');
        router.push('/strategies');
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="strategy-form">
      {/* Basic Info */}
      <div className="form-section card">
        <h3 className="section-title">Basic Information</h3>
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Strategy Name *</label>
            <input
              id="strategy-name"
              type="text"
              placeholder="e.g. Liquidity Sweep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="field">
            <label className="field-label">Description</label>
            <input
              id="strategy-description"
              type="text"
              placeholder="Brief description of your strategy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="toggle-row">
          <div>
            <span className="field-label">Active</span>
            <p style={{ fontSize: '0.75rem', color: '#71717a', margin: '2px 0 0' }}>
              Active strategies appear in trade entry forms
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            className={`toggle ${isActive ? 'on' : ''}`}
            onClick={() => setIsActive(!isActive)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="form-section card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Custom Parameters</h3>
            <p className="section-desc">
              These fields appear dynamically when logging a trade with this strategy.
            </p>
          </div>
          <button type="button" className="btn-add-param" onClick={addParameter} id="btn-add-parameter">
            <Plus size={14} /> Add Parameter
          </button>
        </div>

        {parameters.length === 0 && (
          <div className="empty-hint">
            <Info size={14} style={{ color: 'var(--color-placeholder)' }} />
            <span>No parameters yet. Add parameters to capture strategy-specific data for each trade.</span>
          </div>
        )}

        <div className="params-list">
          {parameters.map((param, index) => (
            <div key={param.key} className="param-row">
              <GripVertical size={14} style={{ color: '#3f3f46', flexShrink: 0 }} />

              <div className="param-fields">
                <div className="param-field-group">
                  <input
                    type="text"
                    placeholder="Label (e.g. Session)"
                    value={param.label}
                    onChange={(e) => updateParameter(index, { label: e.target.value })}
                    className="form-input param-input"
                  />
                  <select
                    value={param.type}
                    onChange={(e) =>
                      updateParameter(index, { type: e.target.value as StrategyParameter['type'] })
                    }
                    className="form-select"
                  >
                    {PARAMETER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {(param.type === 'select' || param.type === 'multiselect') && (
                  <input
                    type="text"
                    placeholder="Options (comma-separated): London, New York, Asian"
                    value={param.options?.join(', ') ?? ''}
                    onChange={(e) =>
                      updateParameter(index, {
                        options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                      })
                    }
                    className="form-input"
                    style={{ marginTop: 6 }}
                  />
                )}
              </div>

              <label className="required-label">
                <input
                  type="checkbox"
                  checked={param.required}
                  onChange={(e) => updateParameter(index, { required: e.target.checked })}
                  className="checkbox"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Required</span>
              </label>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeParameter(index)}
                title="Remove parameter"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="form-section card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Trade Checklist</h3>
            <p className="section-desc">
              Required conditions that must be checked before a trade can be saved.
            </p>
          </div>
          <button type="button" className="btn-add-param" onClick={addChecklistItem} id="btn-add-checklist">
            <Plus size={14} /> Add Item
          </button>
        </div>

        {checklist.length === 0 && (
          <div className="empty-hint">
            <Info size={14} style={{ color: 'var(--color-placeholder)' }} />
            <span>No checklist items. Add items to enforce trading rules.</span>
          </div>
        )}

        <div className="params-list">
          {checklist.map((item, index) => (
            <div key={item.id} className="param-row">
              <GripVertical size={14} style={{ color: '#3f3f46', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="e.g. Liquidity Taken"
                value={item.label}
                onChange={(e) => updateChecklist(index, { label: e.target.value })}
                className="form-input"
                style={{ flex: 1 }}
              />
              <label className="required-label">
                <input
                  type="checkbox"
                  checked={item.required}
                  onChange={(e) => updateChecklist(index, { required: e.target.checked })}
                  className="checkbox"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Required</span>
              </label>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeChecklistItem(index)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="form-footer">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => router.push('/strategies')}
        >
          Cancel
        </button>
        <button
          id="btn-save-strategy"
          type="submit"
          className="btn-save"
          disabled={isPending}
        >
          {isPending ? (
            <span className="spinner" />
          ) : strategy ? 'Update Strategy' : 'Create Strategy'}
        </button>
      </div>

      <style jsx>{`
        .strategy-form { display: flex; flex-direction: column; gap: 20px; max-width: 800px; }
        .form-section { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .section-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .section-desc { font-size: 0.8125rem; color: #71717a; margin: 4px 0 0; }
        .section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.8125rem; font-weight: 500; color: var(--color-muted-foreground); }
        .form-input {
          padding: 8px 12px; background: var(--color-background); border: 1px solid var(--color-border);
          border-radius: 8px; color: var(--color-foreground); font-size: 0.875rem; font-family: inherit;
          outline: none; transition: border-color 0.15s; width: 100%;
        }
        .form-input::placeholder { color: #3f3f46; }
        .form-input:focus { border-color: #3b82f6; }
        .form-select {
          padding: 8px 12px; background: var(--color-background); border: 1px solid var(--color-border);
          border-radius: 8px; color: var(--color-foreground); font-size: 0.875rem; font-family: inherit;
          outline: none; cursor: pointer; min-width: 140px;
        }
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 8px; border-top: 1px solid var(--color-border-subtle);
        }
        .toggle {
          width: 40px; height: 22px;
          background: var(--color-border); border: none; border-radius: 99px;
          cursor: pointer; position: relative; transition: background 0.2s;
          flex-shrink: 0;
        }
        .toggle.on { background: #3b82f6; }
        .toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px;
          background: white; border-radius: 50%;
          transition: left 0.2s ease;
        }
        .toggle.on .toggle-thumb { left: 21px; }
        .btn-add-param {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 12px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 8px;
          color: #3b82f6; font-size: 0.8125rem; font-weight: 500;
          cursor: pointer; white-space: nowrap; transition: all 0.15s;
        }
        .btn-add-param:hover { background: rgba(59,130,246,0.14); }
        .empty-hint {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed var(--color-border); border-radius: 8px;
          font-size: 0.8125rem; color: var(--color-placeholder);
        }
        .params-list { display: flex; flex-direction: column; gap: 8px; }
        .param-row {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid #1e1e1e; border-radius: 8px;
          transition: border-color 0.15s;
        }
        .param-row:hover { border-color: #2e2e2e; }
        .param-fields { flex: 1; display: flex; flex-direction: column; gap: 0; }
        .param-field-group { display: flex; gap: 8px; align-items: stretch; }
        .param-input { flex: 1; }
        .required-label { display: flex; align-items: center; gap: 5px; cursor: pointer; white-space: nowrap; padding-top: 8px; }
        .checkbox { accent-color: #3b82f6; cursor: pointer; }
        .remove-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          background: none; border: none; color: var(--color-placeholder);
          cursor: pointer; transition: all 0.15s; flex-shrink: 0; margin-top: 4px;
        }
        .remove-btn:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .form-footer { display: flex; gap: 10px; justify-content: flex-end; }
        .btn-cancel {
          padding: 9px 18px; background: none;
          border: 1px solid var(--color-border); border-radius: 8px;
          color: var(--color-muted-foreground); font-size: 0.875rem; cursor: pointer; transition: all 0.15s;
        }
        .btn-cancel:hover { border-color: #3f3f46; color: var(--color-foreground); }
        .btn-save {
          padding: 9px 20px;
          background: #3b82f6; border: none; border-radius: 8px;
          color: white; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
          display: flex; align-items: center; gap: 8px; min-width: 140px; justify-content: center;
        }
        .btn-save:hover { background: #2563eb; }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
