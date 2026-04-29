import { getEventSession, requireEventAuth } from '@/app/actions/event-auth';
import { getEventById } from '@/app/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EventNav from '@/app/components/EventNav';
import BottomNav from '@/app/components/BottomNav';
import { Calendar, Settings } from 'lucide-react';

export default async function EventDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  await requireEventAuth(params.eventId);
  const { data: event } = await getEventById(params.eventId);
  const session = await getEventSession();

  if (!event) {
    redirect('/admin');
  }

  const canEdit = Boolean(
    session &&
      session.eventId === params.eventId &&
      session.username &&
      session.username === event.username,
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">{event.name}</h1>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                {event.organizations?.name || 'Event Management'}
              </p>
            </div>
            {canEdit && (
              <Link
                href={`/admin/events/${params.eventId}/dashboard/settings`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md font-bold text-sm active:scale-95"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Bar - Fixed to Top */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between h-[56px]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Live Event</span>
          <h1 className="text-sm font-black text-gray-900 truncate max-w-[200px] leading-tight">{event.name}</h1>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
      </header>

      {/* Navigation Bar - Desktop Only */}
      <div className="hidden md:block flex-none">
        <EventNav eventId={params.eventId} canEdit={canEdit} />
      </div>

      {/* Main Content with padding for fixed header and footer */}
      <main className="flex-1 pt-[56px] pb-[72px] md:pt-0 md:pb-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

