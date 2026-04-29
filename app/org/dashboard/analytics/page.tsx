import { getOrgSession } from '@/lib/org-auth';
import { getEvents } from '@/app/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Calendar, Users, ArrowRight } from 'lucide-react';

export default async function OrgAnalyticsSummaryPage() {
  const session = await getOrgSession();
  if (!session) redirect('/register');

  const { data: events } = await getEvents(session.orgId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Mobile Header Card */}
      <div className="md:hidden mb-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl text-white text-center">
        <h1 className="text-3xl font-black mb-2">Analytics</h1>
        <p className="text-blue-100 text-sm">Monitor event attendance and participant statistics.</p>
      </div>

      <div className="hidden md:block mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Analytics</h1>
        <p className="text-gray-600 mt-1">Select an event to view detailed statistics and real-time activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Link 
            key={event.id}
            href={`/org/dashboard/analytics/${event.id}`}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 truncate max-w-[180px]">{event.name}</h3>
                <p className="text-xs text-gray-500">{event.event_type || 'Event'}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}

        {(!events || events.length === 0) && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No events found to analyze.</p>
          </div>
        )}
      </div>
    </div>
  );
}
