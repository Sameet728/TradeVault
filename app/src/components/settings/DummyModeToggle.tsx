'use client';

import * as React from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Cpu } from 'lucide-react';

export function DummyModeToggle() {
  const router = useRouter();
  const [isDummy, setIsDummy] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setIsDummy(Cookies.get('dummy-mode') === 'true');
    setMounted(true);
  }, []);

  const toggleDummyMode = () => {
    const newValue = !isDummy;
    setIsDummy(newValue);
    if (newValue) {
      Cookies.set('dummy-mode', 'true', { path: '/' });
    } else {
      Cookies.remove('dummy-mode', { path: '/' });
    }
    router.refresh();
  };

  return (
    <div className="dummy-card card">
      <div className="dummy-left">
        <div className="dummy-icon"><Cpu size={15} /></div>
        <div>
          <div className="dummy-title">Demo / Dummy Mode</div>
          <div className="dummy-desc">
            Populate the entire app with mock data. Useful for demonstrating features without real trades.
          </div>
        </div>
      </div>

      {mounted && (
        <button
          onClick={toggleDummyMode}
          className={`toggle-track ${isDummy ? 'on' : 'off'}`}
          aria-label={isDummy ? 'Disable dummy mode' : 'Enable dummy mode'}
          role="switch"
          aria-checked={isDummy}
          id="btn-dummy-mode-toggle"
        >
          <span className={`toggle-thumb ${isDummy ? 'on' : 'off'}`} />
        </button>
      )}

      <style jsx>{`
        .dummy-card {
          padding: 18px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
          border-color: rgba(245,158,11,0.2);
        }
        .dummy-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; }
        .dummy-icon {
          width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-warning);
        }
        .dummy-title { font-size: 0.875rem; font-weight: 600; color: var(--color-warning); margin-bottom: 3px; }
        .dummy-desc { font-size: 0.8125rem; color: var(--color-muted-foreground); line-height: 1.5; }

        /* Toggle switch */
        .toggle-track {
          position: relative;
          width: 40px; height: 22px;
          border-radius: 11px;
          border: none; cursor: pointer;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
        }
        .toggle-track.on  { background: var(--color-warning); }
        .toggle-track.off { background: var(--color-border); }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          transition: left 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .toggle-thumb.on  { left: 21px; }
        .toggle-thumb.off { left: 3px; }
      `}</style>
    </div>
  );
}
