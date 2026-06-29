'use client';

import { Bell, Menu, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
  actions?: React.ReactNode;
}

export function Topbar({ title, onMenuClick, sidebarCollapsed, actions }: TopbarProps) {
  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile menu */}
      <button
        className="menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation"
        id="btn-mobile-menu"
      >
        <Menu size={16} />
      </button>

      {/* Title */}
      {title && <span className="topbar-title">{title}</span>}

      <div className="topbar-right">
        {/* Search hint */}
        <button className="search-hint" aria-label="Search" id="btn-global-search">
          <Search size={13} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>

        {/* Add Trade */}
        <Link href="/trades/new" id="btn-quick-add" className="btn-primary-link">
          <Plus size={13} />
          <span className="quick-add-text">Add Trade</span>
        </Link>

        {/* Notifications */}
        <button className="icon-btn" aria-label="Notifications" id="btn-notifications">
          <Bell size={14} />
        </button>

        {actions}
      </div>

      <style jsx>{`
        .topbar {
          position: fixed; top: 0; right: 0; left: 240px;
          height: 52px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          z-index: 40;
          display: flex; align-items: center;
          padding: 0 20px; gap: 10px;
          transition: left 0.2s ease;
        }
        .topbar.sidebar-collapsed { left: 56px; }

        @media (max-width: 768px) {
          .topbar { left: 0; padding: 0 14px; }
          .topbar.sidebar-collapsed { left: 0; }
        }

        .menu-btn {
          display: none;
          background: none; border: none;
          color: var(--color-muted-foreground);
          cursor: pointer; padding: 6px; border-radius: 5px;
          transition: color 0.12s, background 0.12s;
          align-items: center; justify-content: center;
        }
        .menu-btn:hover { color: var(--color-foreground); background: var(--color-border-subtle); }
        @media (max-width: 768px) { .menu-btn { display: flex; } }

        .topbar-title {
          font-size: 0.875rem; font-weight: 600;
          color: var(--color-foreground); letter-spacing: -0.01em;
        }

        .topbar-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 8px;
        }

        .search-hint {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-placeholder);
          font-size: 0.8125rem; font-family: inherit;
          cursor: pointer; transition: all 0.12s;
          min-width: 160px;
        }
        .search-hint:hover {
          border-color: #3F3F46;
          color: var(--color-muted-foreground);
        }
        kbd {
          font-size: 0.6875rem; padding: 1px 5px;
          background: var(--color-border-subtle);
          border: 1px solid var(--color-border);
          border-radius: 3px;
          color: var(--color-placeholder);
          font-family: inherit; margin-left: auto;
        }
        @media (max-width: 640px) { .search-hint { display: none; } }

        @media (max-width: 480px) { .quick-add-text { display: none; } }

        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          background: none; border: 1px solid var(--color-border);
          border-radius: 6px; color: var(--color-muted-foreground);
          cursor: pointer; transition: all 0.12s;
        }
        .icon-btn:hover { color: var(--color-foreground); border-color: #3F3F46; }
      `}</style>
    </header>
  );
}
