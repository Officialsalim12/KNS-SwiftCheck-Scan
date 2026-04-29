import { getOrgSession } from '@/lib/org-auth';
import { getEvents } from '@/app/actions/events';
import OrgEventList from '@/app/components/org/OrgEventList';
import Link from 'next/link';
import { Plus, Calendar, Users, BarChart3 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organization Dashboard',
  description: 'Manage your KNS attendance events and analytics.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrgDashboard() {
  const session = await getOrgSession();
  
  if (!session) return null; // Should be handled by layout.tsx redirect

  const { data: events, error } = await getEvents(session.orgId);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in lg:text-lg">
      {/* Mobile Stats Card */}
      <div className="md:hidden mb-8 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-2xl shadow-blue-500/20">
        <div className="relative z-10">
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10 text-center">
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Events</p>
              <p className="text-white text-3xl font-black">{events?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your attendance tracking events and monitor participant activity.
          </p>
        </div>
        
        <Link 
          href="/org/dashboard/new-event"
          className="hidden md:inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Event
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <p className="font-semibold">Error loading events</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <OrgEventList events={events || []} />
      )}
    </div>
  );
}
