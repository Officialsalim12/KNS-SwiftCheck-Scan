import { getParticipants } from '@/app/actions/participants';
import Link from 'next/link';
import ParticipantCard from '@/app/components/ParticipantCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventParticipantsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { data: participants, error } = await getParticipants(params.eventId);

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading participants: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Participants</h1>
        <p className="text-gray-600">Manage training participants and their QR codes</p>
      </div>

      {!participants || participants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No participants found.</p>
          <Link
            href={`/admin/events/${params.eventId}/dashboard/add-participant`}
            className="text-blue-600 hover:text-blue-700"
          >
            Add your first participant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participants.map((participant: any) => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))}
        </div>
      )}
    </div>
  );
}

