import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await currentUser();

  return (
    <DashboardShell
      userName={user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : undefined}
      userImage={user?.imageUrl ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
