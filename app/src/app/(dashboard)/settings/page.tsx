import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/shared/PageHeader';
import { SettingsClient } from '@/components/settings/SettingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const clerkUser = await currentUser();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />
      <SettingsClient
        user={{
          name: clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName ?? ''}`.trim() : '',
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
          createdAt: new Date(clerkUser?.createdAt || Date.now()).toISOString(),
        }}
      />
    </div>
  );
}
