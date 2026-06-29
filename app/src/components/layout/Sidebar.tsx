'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard, TrendingUp, BookOpen, BarChart3, Calendar,
  Settings, LogOut, Zap, Upload, Target, FileText, BrainCircuit,
  ChevronRight, Wallet,
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
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
      { label: 'Calendar', href: '/calendar', icon: <Calendar size={16} /> },
    ],
  },
  {
    label: 'Trading',
    items: [
      { label: 'Trades', href: '/trades', icon: <TrendingUp size={16} /> },
      { label: 'Strategies', href: '/strategies', icon: <Zap size={16} /> },
      { label: 'Accounts', href: '/accounts', icon: <Wallet size={16} /> },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={16} /> },
      { label: 'Prop Tracker', href: '/prop-tracker', icon: <Target size={16} /> },
    ],
  },
  {
    label: 'AI',
    items: [
      { label: 'AI Review', href: '/ai/review', icon: <BrainCircuit size={16} /> },
      { label: 'Weekly Report', href: '/ai/weekly', icon: <BookOpen size={16} /> },
      { label: 'Pattern Finder', href: '/ai/patterns', icon: <TrendingUp size={16} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Import', href: '/import', icon: <Upload size={16} /> },
      { label: 'Reports', href: '/reports', icon: <FileText size={16} /> },
      { label: 'Settings', href: '/settings', icon: <Settings size={16} /> },
    ],
  },
];

interface SidebarProps {
  userName?: string;
  userImage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ userName, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <TrendingUp size={16} color="#3b82f6" />
            </div>
            <span className="sidebar-logo-text">TradeVault</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.label} className="nav-group">
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive(item.href) && (
                    <ChevronRight size={12} className="active-arrow" />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <UserButton showName />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <style jsx>{`
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 49;
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
          transition: transform 0.25s ease;
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
        }
        .sidebar-header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; }
        .sidebar-logo-icon {
          width: 30px; height: 30px;
          background: var(--color-accent-subtle);
          border: 1px solid var(--color-accent-muted);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sidebar-logo-icon svg { color: var(--color-accent) !important; stroke: var(--color-accent) !important; }
        .sidebar-logo-text { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); }
        .sidebar-nav {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 12px 8px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .nav-group { margin-bottom: 4px; }
        .nav-group-label {
          display: block;
          font-size: 0.6875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--color-placeholder);
          padding: 8px 12px 4px;
        }
        :global(.sidebar-link) {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 12px;
          border-radius: 4px;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--color-muted-foreground);
          text-decoration: none;
          transition: all 0.12s ease;
          cursor: pointer; width: 100%; border: none; background: none;
          position: relative;
        }
        :global(.sidebar-link:hover) { color: var(--color-foreground); background: var(--color-border-subtle); }
        :global(.sidebar-link.active) { color: var(--color-foreground); background: var(--color-accent-subtle); }
        :global(.sidebar-link.active .sidebar-icon) { color: var(--color-accent); }
        :global(.sidebar-icon) { flex-shrink: 0; transition: color 0.12s; }
        :global(.active-arrow) { margin-left: auto; color: var(--color-accent); }
        .sidebar-footer {
          border-top: 1px solid var(--color-border-subtle);
          padding: 12px 8px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .user-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; margin-bottom: 4px;
        }
        .user-avatar {
          width: 28px; height: 28px;
          background: var(--color-accent-subtle);
          border: 1px solid var(--color-accent-muted);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 600; color: var(--color-accent);
          flex-shrink: 0;
        }
        .user-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .user-name { font-size: 0.8125rem; font-weight: 500; color: var(--color-foreground); truncate; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .user-plan { font-size: 0.6875rem; color: var(--color-placeholder); }
        .logout-btn { color: var(--color-muted-foreground) !important; }
        .logout-btn:hover { color: var(--color-loss) !important; background: var(--color-loss-muted) !important; }
      `}</style>
    </>
  );
}
