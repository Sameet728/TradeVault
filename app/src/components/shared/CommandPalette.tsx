'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Activity, BookOpen, Target, Settings } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { name: 'Dashboard', route: '/dashboard', icon: <Activity size={16} /> },
    { name: 'Log a Trade', route: '/trades/new', icon: <Plus size={16} /> },
    { name: 'Trade History', route: '/trades', icon: <BookOpen size={16} /> },
    { name: 'My Playbooks', route: '/playbooks', icon: <Target size={16} /> },
    { name: 'Settings', route: '/settings', icon: <Settings size={16} /> },
  ];

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (route: string) => {
    setOpen(false);
    setQuery('');
    router.push(route);
  };

  if (!open) return null;

  return (
    <div className="cmd-backdrop" onClick={() => setOpen(false)}>
      <div className="cmd-dialog" onClick={e => e.stopPropagation()}>
        <div className="cmd-header">
          <Search size={18} className="cmd-icon" />
          <input
            autoFocus
            className="cmd-input"
            placeholder="Search commands... (e.g. Log a trade)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>
        <div className="cmd-list">
          {filteredCommands.length === 0 ? (
            <div className="cmd-empty">No results found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div 
                key={idx} 
                className="cmd-item"
                onClick={() => handleSelect(cmd.route)}
              >
                {cmd.icon}
                <span>{cmd.name}</span>
                <span className="cmd-route">{cmd.route}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .cmd-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          z-index: 9999; display: flex; align-items: flex-start; justify-content: center;
          padding-top: 12vh;
        }
        .cmd-dialog {
          width: 100%; max-width: 500px; background: var(--color-surface);
          border: 1px solid var(--color-border); border-radius: 8px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5); overflow: hidden;
          animation: slideDown 0.15s ease-out;
        }
        .cmd-header {
          display: flex; align-items: center; padding: 12px 16px;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .cmd-icon { color: var(--color-placeholder); margin-right: 12px; }
        .cmd-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--color-foreground); font-size: 1rem;
        }
        .cmd-kbd {
          background: var(--color-background); border: 1px solid var(--color-border);
          padding: 2px 6px; border-radius: 4px; font-size: 0.6875rem;
          color: var(--color-muted-foreground); font-family: monospace;
        }
        .cmd-list { padding: 8px; max-height: 300px; overflow-y: auto; }
        .cmd-empty { padding: 24px; text-align: center; color: var(--color-placeholder); font-size: 0.875rem; }
        .cmd-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px;
          color: var(--color-foreground); font-size: 0.875rem; border-radius: 6px;
          cursor: pointer; transition: background 0.1s;
        }
        .cmd-item:hover { background: var(--color-border-subtle); }
        .cmd-route { margin-left: auto; color: var(--color-placeholder); font-size: 0.75rem; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
