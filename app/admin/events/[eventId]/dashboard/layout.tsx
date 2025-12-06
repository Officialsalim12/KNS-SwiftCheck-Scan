import { getEventSession, requireEventAuth } from '@/app/actions/event-auth';
import { getEventById } from '@/app/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
            {canEdit && (
              <Link
                href={`/admin/events/${params.eventId}/dashboard/settings`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Event
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <EventNav eventId={params.eventId} canEdit={canEdit} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

