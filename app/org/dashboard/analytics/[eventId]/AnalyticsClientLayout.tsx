'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AnalyticsClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const eventId = params.eventId as string;

  const isLoginPage = pathname.endsWith('/login');
  const dashboardPath = `/org/dashboard/analytics/${eventId}`;
  
  // If we are deep in a sub-page (like /participants), the top back arrow should go to the event dash.
  // If we are ON the event dash, it goes back to the main org list.
  const isAtRootAnalytics = pathname === dashboardPath;
  const backButtonHref = isAtRootAnalytics ? '/org/dashboard' : dashboardPath;

  const tabs = [
    { name: 'Dashboard', href: dashboardPath, active: pathname === dashboardPath },
    { name: 'Participants', href: `${dashboardPath}/participants`, active: pathname.includes('/participants') },
    { name: 'Attendance', href: `${dashboardPath}/attendance`, active: pathname.includes('/attendance') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href={backButtonHref}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                title={isAtRootAnalytics ? "Back to Event List" : "Back to Event Dashboard"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h2 className="sr-only">Event Analytics</h2>
            </div>
            
            {!isLoginPage && (
              <div className="flex-1 ml-2 md:ml-4 overflow-x-auto no-scrollbar">
                <nav className="flex gap-1 w-full">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`flex-1 text-center px-2 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest whitespace-nowrap ${
                        tab.active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
      <main>
        {children}
      </main>
    </div>
  );
}
