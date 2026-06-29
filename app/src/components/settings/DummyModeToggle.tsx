'use client';

import * as React from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function DummyModeToggle() {
  const router = useRouter();
  const [isDummy, setIsDummy] = React.useState(false);

  React.useEffect(() => {
    setIsDummy(Cookies.get('dummy-mode') === 'true');
  }, []);

  const toggleDummyMode = () => {
    const newValue = !isDummy;
    setIsDummy(newValue);
    if (newValue) {
      Cookies.set('dummy-mode', 'true', { path: '/' });
    } else {
      Cookies.remove('dummy-mode', { path: '/' });
    }
    // Refresh to allow server components/actions to pick up the cookie
    router.refresh();
  };

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 border-warning/20">
      <div>
        <h3 className="text-lg font-semibold text-warning mb-1">Demo / Dummy Mode</h3>
        <p className="text-sm text-muted-foreground">
          Toggle dummy mode to populate the entire application with mock data. Useful for demonstrating features without real trades.
        </p>
      </div>
      <button
        onClick={toggleDummyMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 focus:ring-offset-background ${
          isDummy ? 'bg-warning' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDummy ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
