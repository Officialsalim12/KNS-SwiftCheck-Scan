import { getOrgSession } from '@/lib/org-auth';
import { getEvents } from '@/app/actions/events';
import OrgEventList from '@/app/components/org/OrgEventList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrgDashboard() {
  const session = await getOrgSession();
  
  if (!session) return null; // Should be handled by layout.tsx redirect

  const { data: events, error } = await getEvents(session.orgId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your attendance tracking events and monitor participant activity.
          </p>
        </div>
        
        {/* Placeholder for Create Event - we can link to a form or modal later */}
        <Link 
          href="/org/dashboard/new-event"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md active:scale-95"
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
