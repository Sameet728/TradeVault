'use client';

import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import type { ChecklistItem } from '@/types/strategy.types';

interface ChecklistPanelProps {
  checklist: ChecklistItem[];
  values: Record<string, boolean>;
  onChange: (values: Record<string, boolean>) => void;
  readOnly?: boolean;
}

export function ChecklistPanel({ checklist, values, onChange, readOnly }: ChecklistPanelProps) {
  const requiredItems = checklist.filter((c) => c.required);
  const completedRequired = requiredItems.filter((c) => values[c.id]).length;
  const allRequiredDone = completedRequired === requiredItems.length;

  function toggle(id: string) {
    if (readOnly) return;
    onChange({ ...values, [id]: !values[id] });
  }

  return (
    <div className="checklist-panel card">
      <div className="checklist-header">
        <h3 className="checklist-title">Pre-Trade Checklist</h3>
        <div className="checklist-progress">
          <div
            className="progress-fill"
            style={{
              width: `${checklist.length ? (Object.values(values).filter(Boolean).length / checklist.length) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="checklist-count">
          {Object.values(values).filter(Boolean).length}/{checklist.length}
        </span>
      </div>

      {!allRequiredDone && requiredItems.length > 0 && (
        <div className="checklist-warning">
          <AlertCircle size={13} />
          <span>Complete all required items ({completedRequired}/{requiredItems.length}) before saving</span>
        </div>
      )}

      <div className="checklist-items">
        {checklist.map((item) => {
          const checked = !!values[item.id];
          return (
            <button
              key={item.id}
              type="button"
              className={`checklist-item ${checked ? 'checked' : ''} ${readOnly ? 'readonly' : ''}`}
              onClick={() => toggle(item.id)}
            >
              <span className="check-icon">
                {checked ? (
                  <CheckSquare size={16} color="#22c55e" />
                ) : (
                  <Square size={16} color="var(--color-placeholder)" />
                )}
              </span>
              <span className="item-label">{item.label}</span>
              {item.required && !checked && (
                <span className="required-tag">Required</span>
              )}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .checklist-panel { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .checklist-header { display: flex; align-items: center; gap: 12px; }
        .checklist-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; flex-shrink: 0; }
        .checklist-progress {
          flex: 1; height: 4px; background: var(--color-border); border-radius: 99px; overflow: hidden;
        }
        .progress-fill {
          height: 100%; background: #22c55e; border-radius: 99px; transition: width 0.3s ease;
        }
        .checklist-count { font-size: 0.75rem; color: #71717a; white-space: nowrap; }
        .checklist-warning {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          font-size: 0.8125rem; color: #ef4444;
        }
        .checklist-items { display: flex; flex-direction: column; gap: 4px; }
        .checklist-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px; cursor: pointer;
          transition: all 0.12s; text-align: left;
          font-family: inherit;
        }
        .checklist-item:hover:not(.readonly) { border-color: var(--color-border); background: var(--color-border-subtle); }
        .checklist-item.checked { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.04); }
        .checklist-item.readonly { cursor: default; }
        .check-icon { flex-shrink: 0; }
        .item-label { flex: 1; font-size: 0.875rem; color: var(--color-foreground); }
        .checklist-item.checked .item-label { color: #71717a; text-decoration: line-through; }
        .required-tag {
          font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
          color: #ef4444; padding: 1px 6px; border-radius: 4px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
        }
      `}</style>
    </div>
  );
}
