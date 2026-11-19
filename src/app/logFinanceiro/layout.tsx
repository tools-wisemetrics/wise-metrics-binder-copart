import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { FilterYear } from '@/components/filters/filter-year';
import { MobileNav } from '@/components/layout/mobile-nav';
import { verifySession } from '@/lib/auth/dal';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await verifySession();

  return (
    <div className='flex h-screen overflow-hidden bg-[#f4f7fb]'>
      <Suspense fallback={<div className='hidden md:block w-64 flex-shrink-0 h-screen bg-[#0b1f3a]' />}>
        <Sidebar />
      </Suspense>
      <div className='flex-1 flex flex-col min-w-0 overflow-y-auto'>{children}</div>
    </div>
  );
}
