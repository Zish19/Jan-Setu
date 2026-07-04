'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neo-bg flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 neo-box flex items-center justify-between px-6 bg-neo-surface sticky top-0 z-50">
        <div className="font-black text-2xl tracking-tighter">Jan-Setu Command</div>
        <nav className="flex items-center gap-4">
          <Button variant="secondary" size="sm">Start Demo</Button>
          <div className="w-10 h-10 neo-box rounded-full bg-neo-accent flex items-center justify-center text-white font-bold">
            MP
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6">
        {children}
      </main>
    </div>
  );
}
