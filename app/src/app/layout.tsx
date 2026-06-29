import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

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
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning style={{ backgroundColor: '#0A0A0A' }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClerkProvider 
            appearance={{ 
              theme: dark,
              variables: {
                colorPrimary: '#3b82f6',
              }
            }}
          >
            {children}
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
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
