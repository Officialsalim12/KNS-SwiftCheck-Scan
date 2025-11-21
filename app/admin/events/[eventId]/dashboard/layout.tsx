import { requireEventAuth } from '@/app/actions/event-auth';
import { getEventById } from '@/app/actions/events';
import { redirect } from 'next/navigation';
import EventNav from '@/app/components/EventNav';

export default async function EventDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  await requireEventAuth(params.eventId);
  const { data: event } = await getEventById(params.eventId);

  if (!event) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with Event Info */}
      <header className="bg-white shadow-lg border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-sm text-gray-600">
                {event.organizations?.name || 'Event'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <EventNav eventId={params.eventId} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

