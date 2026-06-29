export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`logo-container flex items-center gap-2 font-bold text-lg ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7L3 11C3 16.5 6.8 21.7 12 23C17.2 21.7 21 16.5 21 11V7L12 2Z" fill="url(#paint0_linear)"/>
        <path d="M12 16L7 11L8.4 9.6L12 13.2L19.6 5.6L21 7L12 16Z" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6"/>
            <stop offset="1" stopColor="#1d4ed8"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="tracking-tight" style={{ color: 'var(--color-foreground)' }}>TradeVault</span>
    </div>
  );
}
