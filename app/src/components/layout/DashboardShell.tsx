'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string;
  userImage?: string;
}

export function DashboardShell({ children, userName, userImage }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar
        userName={userName}
        userImage={userImage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Topbar
        onMenuClick={() => setSidebarOpen(true)}
      />
      <main className="main-content">
        <div className="page-inner">
          {children}
        </div>
      </main>

      <style jsx>{`
        .main-content {
          margin-left: 240px;
          padding-top: 56px;
          min-height: 100vh;
        }
        .page-inner {
          padding: 32px;
          max-width: 1400px;
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0; }
          .page-inner { padding: 20px 16px; }
        }
      `}</style>
    </>
  );
}
