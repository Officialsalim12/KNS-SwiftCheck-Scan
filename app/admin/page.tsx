import { getEvents } from '@/app/actions/events';
import Link from 'next/link';
import EventForm from '@/app/components/EventForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatEventDates(startDate?: string | null, endDate?: string | null) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    if (start === end) return start;
    return `${start} - ${end}`;
  }

  return start || end || 'Date not set';
}

export default async function AdminDashboard() {
  const { data: events, error: eventError } = await getEvents();

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">System Dashboard</h1>
        <p className="text-gray-600">Manage events</p>
      </div>

      {/* Create Event Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Event</h2>
        <EventForm />
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Events</h2>
        {eventError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading events: {eventError}
          </div>
        ) : !events || events.length === 0 ? (
          <p className="text-gray-500">No events found. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Organization: {event.organizations?.name || 'N/A'}
                </p>
                {event.location && (
                  <p className="text-sm text-gray-600 mb-2">Location: {event.location}</p>
                )}
                {event.description && (
                  <p className="text-sm text-gray-500 mb-2">{event.description}</p>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  Event Type: {event.event_type || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Event Date: {formatEventDates(event.start_date, event.end_date)}
                </p>
                <Link
                  href={`/admin/events/${event.id}/login`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Access Event Dashboard
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

