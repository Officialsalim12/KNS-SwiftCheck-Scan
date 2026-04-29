import { getOrgSession } from '@/lib/org-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import LogoutButton from '@/app/components/ui/LogoutButton';

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOrgSession();

  if (!session) {
    redirect('/register');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header - Desktop Only */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40 flex-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Organization Console</p>
              <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                {session.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar - Fixed to Top */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between h-[56px]">
        <Link href="/org/dashboard" className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Organization</span>
        </Link>
        <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
          {session.name}
        </p>
      </header>

      {/* Main Content with padding for fixed header and footer */}
      <main className="flex-1 pt-[56px] pb-[72px] md:pt-0 md:pb-0">
        <div className="p-4 md:p-0">
          {children}
        </div>
      </main>

      <BottomNav />

      {/* Footer - Desktop Only */}
      <footer className="hidden md:block bg-white border-t border-gray-200 py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
