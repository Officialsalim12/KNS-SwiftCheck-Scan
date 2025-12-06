import { getEventSession } from '@/app/actions/event-auth';
import { getEventById } from '@/app/actions/events';
import EditEventForm from '@/app/components/EditEventForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventSettingsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { data: event, error } = await getEventById(params.eventId);
  const session = await getEventSession();

  if (error || !event) {
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Unable to load event: {error || 'Event not found'}
        </div>
      </div>
    );
  }

  const isPrimaryUser =
    session &&
    session.eventId === params.eventId &&
    session.username &&
    session.username === event.username;

  if (!isPrimaryUser) {
    return (
      <div className="px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Only the primary account for this event can view or edit settings.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Event Settings
            </h1>
            <p className="text-lg text-gray-600">
              Update event details and manage user access
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <EditEventForm event={event} />
        </div>
      </div>
    </div>
  );
}

