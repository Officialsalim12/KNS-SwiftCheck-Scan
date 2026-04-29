import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import Image from 'next/image';
import LogoutButton from '@/app/components/ui/LogoutButton';
import BottomNav from '@/app/components/BottomNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAdminAuth();

  // Protect all admin routes - redirect to register login if not authenticated
  if (!isAuthenticated) {
    redirect('/register');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Sleek Profile Header - Desktop Only */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-gray-100 flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            
            {/* Branding */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="relative h-16 w-16 md:h-20 md:w-20 hover:opacity-90 transition-opacity">
                <Image 
                  src="/WhatsApp_Image_2025-11-12_at_7.05.22_PM-removebg-preview.png"
                  alt="KNS Logo"
                  fill
                  className="object-contain"
                />
              </Link>
              <Link href="/admin" className="flex flex-col justify-center hover:opacity-80 transition-opacity">
                <span className="text-[9px] md:text-[11px] font-extrabold text-blue-900 tracking-wider uppercase leading-none mb-1">Knowledge</span>
                <span className="text-[9px] md:text-[11px] font-extrabold text-blue-800 tracking-wider uppercase leading-none mb-1">Network</span>
                <span className="text-[9px] md:text-[11px] font-extrabold text-blue-700 tracking-wider uppercase leading-none">Solution</span>
              </Link>
            </div>

            {/* Profile Identity & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800 tracking-tight">System Administrator</p>
              </div>
              
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 border-2 border-white shadow-md flex items-center justify-center">
                  <span className="text-blue-800 font-extrabold text-sm tracking-tighter">SA</span>
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></div>
              </div>
              
              <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
              
              <LogoutButton type="system" />
            </div>
            
          </div>
        </div>
      </header>

      {/* Mobile Top Bar - Fixed to Top */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between h-[56px]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Home className="w-5 h-5 text-blue-900" />
          </div>
          <span className="text-lg font-black text-blue-900 tracking-tight">KNS <span className="text-blue-600">SCAN</span></span>
        </Link>
        <div className="text-right">
          <p className="text-[10px] font-bold text-blue-600 uppercase leading-none">System Admin</p>
          <p className="text-xs font-black text-gray-900 leading-tight">Master Terminal</p>
        </div>
      </header>

      {/* Main Content with padding for fixed header and footer */}
      <main className="flex-1 pt-[56px] pb-[72px] md:pt-6 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

