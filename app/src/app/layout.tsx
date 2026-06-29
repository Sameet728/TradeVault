import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ClerkThemeProvider } from '@/components/layout/ClerkThemeProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { CommandPalette } from '@/components/shared/CommandPalette';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TradeVault — Track, Analyze & Improve Your Trading',
    template: '%s | TradeVault',
  },
  description:
    'A professional trading journal for serious traders. Track trades, analyze performance, get AI-powered insights, and grow your edge.',
  keywords: ['trading journal', 'trade tracker', 'forex journal', 'prop firm tracker', 'trading analytics'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'TradeVault — Professional Trade Analytics',
    description: 'Track, analyze and improve your trading performance with AI-powered insights.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClerkThemeProvider>
            {children}
            <CommandPalette />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "bg-card text-foreground border-border",
                style: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                },
              }}
            />
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
