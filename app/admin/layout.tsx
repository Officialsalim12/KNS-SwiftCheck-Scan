import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sleek Profile Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-gray-100">
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
              <Link href="/admin" className="hidden sm:flex flex-col justify-center hover:opacity-80 transition-opacity">
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
              
              <form action={logout}>
                <button
                  type="submit"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                  title="Sign Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-12 pt-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

