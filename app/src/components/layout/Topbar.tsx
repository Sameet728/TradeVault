'use client';

import { Bell, Menu, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export function Topbar({ title, onMenuClick, actions }: TopbarProps) {
  return (
    <header className="topbar">
      {/* Mobile menu */}
      <button
        className="menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation"
        id="btn-mobile-menu"
      >
        <Menu size={18} />
      </button>

      {/* Title / breadcrumb */}
      {title && <span className="topbar-title">{title}</span>}

      <div className="topbar-right">
        {/* Global search hint */}
        <button className="search-hint" aria-label="Search">
          <Search size={14} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>

        {/* Quick add trade */}
        <Link href="/trades/new" id="btn-quick-add" className="btn-primary-link" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
          <Plus size={14} />
          <span className="quick-add-text">Add Trade</span>
        </Link>

        {/* Notifications */}
        <button className="icon-btn" aria-label="Notifications" id="btn-notifications">
          <Bell size={16} />
        </button>

        {/* Actions slot */}
        {actions}
      </div>

      <style jsx>{`
        .topbar {
          position: fixed; top: 0; right: 0; left: 240px;
          height: 56px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border-subtle);
          z-index: 40;
          display: flex; align-items: center;
          padding: 0 24px; gap: 16px;
        }
        @media (max-width: 768px) {
          .topbar { left: 0; padding: 0 16px; }
        }
        .menu-btn {
          display: none;
          background: none; border: none; color: var(--color-muted-foreground);
          cursor: pointer; padding: 6px; border-radius: 6px;
          transition: color 0.15s;
        }
        .menu-btn:hover { color: var(--color-foreground); }
        @media (max-width: 768px) { .menu-btn { display: flex; } }
        .topbar-title {
          font-size: 0.875rem; font-weight: 600; color: var(--color-foreground);
          letter-spacing: -0.01em;
        }
        .topbar-right {
          margin-left: auto; display: flex; align-items: center; gap: 8px;
        }
        .search-hint {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-placeholder); font-size: 0.8125rem; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
        }
        .search-hint:hover { border-color: #3f3f46; color: var(--color-muted-foreground); }
        kbd {
          font-size: 0.6875rem; padding: 1px 5px;
          background: var(--color-border-subtle); border: 1px solid var(--color-border);
          border-radius: 4px; color: var(--color-placeholder); font-family: inherit;
        }
        @media (max-width: 600px) { .search-hint { display: none; } }
        .quick-add {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: var(--color-accent); border-radius: 4px;
          color: white; font-size: 0.8125rem; font-weight: 500;
          text-decoration: none; transition: background-color 0.15s ease;
          white-space: nowrap;
        }
        .quick-add:hover { background: var(--color-accent-hover); }
        @media (max-width: 480px) { .quick-add-text { display: none; } }
        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: none; border: 1px solid var(--color-border);
          border-radius: 8px; color: var(--color-muted-foreground);
          cursor: pointer; transition: all 0.15s;
        }
        .icon-btn:hover { color: var(--color-foreground); border-color: #3f3f46; }
      `}</style>
    </header>
  );
}
