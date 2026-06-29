'use client';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {badge && <span className="page-badge">{badge}</span>}
        </div>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}

      <style jsx>{`
        .page-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .page-header-left { display: flex; flex-direction: column; gap: 3px; }
        .page-title-row { display: flex; align-items: center; gap: 10px; }
        .page-title {
          font-size: 1.375rem; font-weight: 700;
          color: var(--color-foreground);
          letter-spacing: -0.035em; margin: 0;
        }
        .page-badge {
          font-size: 0.5625rem; font-weight: 700;
          padding: 2px 7px; border-radius: 3px;
          background: var(--color-accent-muted);
          border: 1px solid var(--color-accent-subtle);
          color: var(--color-accent);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .page-desc {
          font-size: 0.8125rem; color: var(--color-placeholder);
          margin: 0; line-height: 1.5;
        }
        .page-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
