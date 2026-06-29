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
          gap: 16px; margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .page-header-left { display: flex; flex-direction: column; gap: 4px; }
        .page-title-row { display: flex; align-items: center; gap: 10px; }
        .page-title {
          font-size: 1.625rem; font-weight: 700; color: var(--color-foreground);
          letter-spacing: -0.03em; margin: 0;
        }
        .page-badge {
          font-size: 0.6875rem; font-weight: 600;
          padding: 2px 8px; border-radius: 99px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          color: #3b82f6; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .page-desc { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; }
        .page-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
