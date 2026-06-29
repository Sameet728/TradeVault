'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard, TrendingUp, Zap, BarChart3, Calendar,
  Settings, Upload, Target, FileText, BrainCircuit,
  ChevronRight, Wallet, PanelLeftClose, PanelLeftOpen, BookOpen,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={15} /> },
      { label: 'Calendar', href: '/calendar', icon: <Calendar size={15} /> },
    ],
  },
  {
    label: 'Trading',
    items: [
      { label: 'Trades', href: '/trades', icon: <TrendingUp size={15} /> },
      { label: 'Strategies', href: '/strategies', icon: <Zap size={15} /> },
      { label: 'Accounts', href: '/accounts', icon: <Wallet size={15} /> },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={15} /> },
      { label: 'Prop Tracker', href: '/prop-tracker', icon: <Target size={15} /> },
    ],
  },
  {
    label: 'AI',
    items: [
      { label: 'AI Review', href: '/ai/review', icon: <BrainCircuit size={15} /> },
      { label: 'Weekly Report', href: '/ai/weekly', icon: <BookOpen size={15} /> },
      { label: 'Pattern Finder', href: '/ai/patterns', icon: <TrendingUp size={15} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Import', href: '/import', icon: <Upload size={15} /> },
      { label: 'Reports', href: '/reports', icon: <FileText size={15} /> },
      { label: 'Settings', href: '/settings', icon: <Settings size={15} /> },
    ],
  },
];

interface SidebarProps {
  userName?: string;
  userImage?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ userName, isOpen = true, onClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        {/* Header — Logo + Collapse button */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <TrendingUp size={13} />
            </div>
            {!collapsed && <span className="sidebar-logo-text">TradeVault</span>}
          </div>
          <button
            className="collapse-btn"
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.label} className="nav-group">
              {!collapsed && <span className="nav-group-label">{group.label}</span>}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar-label">{item.label}</span>}
                  {!collapsed && isActive(item.href) && (
                    <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-row">
            <UserButton showName={!collapsed} />
          </div>
          <div className="sidebar-footer-actions">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <style jsx>{`
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 49;
          backdrop-filter: blur(2px);
        }
        @media (max-width: 768px) {
          .sidebar-overlay { display: block; }
        }

        .sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: 240px;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          z-index: 50;
          display: flex; flex-direction: column;
          overflow: hidden;
          transition: width 0.2s ease, transform 0.25s ease;
        }
        .sidebar.collapsed { width: 56px; }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); width: 240px; }
          .sidebar.open { transform: translateX(0); }
          .sidebar.collapsed { width: 240px; transform: translateX(-100%); }
          .sidebar.collapsed.open { transform: translateX(0); }
        }

        /* Header */
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 12px 12px;
          border-bottom: 1px solid var(--color-border-subtle);
          flex-shrink: 0;
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 8px;
          overflow: hidden;
        }
        .sidebar-logo-icon {
          width: 26px; height: 26px; flex-shrink: 0;
          background: var(--color-accent);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: white;
        }
        .sidebar-logo-text {
          font-size: 0.875rem; font-weight: 650;
          color: var(--color-foreground);
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .collapse-btn {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; flex-shrink: 0;
          background: none; border: none; border-radius: 4px;
          color: var(--color-placeholder);
          cursor: pointer; transition: color 0.12s, background 0.12s;
        }
        .collapse-btn:hover {
          color: var(--color-foreground);
          background: var(--color-border-subtle);
        }

        /* Nav */
        .sidebar-nav {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 10px 8px;
          display: flex; flex-direction: column; gap: 0;
        }
        .nav-group { margin-bottom: 2px; }
        .nav-group-label {
          display: block;
          font-size: 0.5625rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--color-placeholder);
          padding: 10px 10px 4px;
          white-space: nowrap;
        }

        :global(.sidebar-link) {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px;
          border-radius: 5px;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--color-muted-foreground);
          text-decoration: none;
          transition: all 0.12s ease;
          cursor: pointer; width: 100%; border: none; background: none;
          position: relative; white-space: nowrap; overflow: hidden;
          font-family: inherit;
        }
        :global(.sidebar-link:hover) {
          color: var(--color-foreground);
          background: var(--color-border-subtle);
        }
        :global(.sidebar-link.active) {
          color: var(--color-foreground);
          background: var(--color-accent-subtle);
        }
        :global(.sidebar-link.active::before) {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 2px; border-radius: 0 2px 2px 0;
          background: var(--color-accent);
        }
        :global(.sidebar-icon) {
          flex-shrink: 0;
          display: flex; align-items: center;
          color: inherit;
          transition: color 0.12s;
        }
        :global(.sidebar-link.active .sidebar-icon) { color: var(--color-accent); }
        :global(.sidebar-label) { flex: 1; overflow: hidden; text-overflow: ellipsis; }

        /* Footer */
        .sidebar-footer {
          border-top: 1px solid var(--color-border-subtle);
          padding: 10px 10px;
          display: flex; flex-direction: column; gap: 8px;
          flex-shrink: 0;
        }
        .sidebar-user-row {
          display: flex; align-items: center;
          min-width: 0; overflow: hidden;
        }
        .sidebar-footer-actions {
          display: flex; align-items: center; gap: 6px;
        }
      `}</style>
    </>
  );
}
