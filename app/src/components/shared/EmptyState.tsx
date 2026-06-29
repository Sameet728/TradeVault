'use client';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}

      <style jsx>{`
        .empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
          padding: 60px 24px; gap: 12px;
        }
        .empty-icon {
          width: 48px; height: 48px;
          background: var(--color-border-subtle);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: var(--color-placeholder); margin-bottom: 4px;
        }
        .empty-title { font-size: 1rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .empty-desc { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; max-width: 320px; line-height: 1.5; }
        .empty-action { margin-top: 4px; }
      `}</style>
    </div>
  );
}
