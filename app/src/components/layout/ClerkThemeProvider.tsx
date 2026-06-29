'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import { ReactNode } from 'react';

export function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#3b82f6',
        },
        elements: {
          card: 'shadow-none border border-[var(--color-border)]',
        }
      } as any}
    >
      {children}
    </ClerkProvider>
  );
}
