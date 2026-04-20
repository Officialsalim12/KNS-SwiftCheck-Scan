import { getOrgSession } from '@/lib/org-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutOrganization } from '@/app/actions/organizations';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Organization Console</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                  {session.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <form action={logoutOrganization}>
                <button
                  type="submit"
                  className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
