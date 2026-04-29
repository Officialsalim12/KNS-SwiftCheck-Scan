import Link from 'next/link';
import ParticipantSearch from '@/app/components/ParticipantSearch';

interface Props {
  eventId: string;
  participants: any[];
  dashboardPath: string; // e.g. "/admin/events/[eventId]/dashboard" or "/org/dashboard/analytics/[eventId]"
}

export default function ParticipantsView({
  eventId,
  participants,
  dashboardPath,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Participants
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage training participants and their QR codes
                </p>
                {participants && participants.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Total: <span className="font-semibold text-blue-600">{participants.length}</span> participant{participants.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <Link
                href={`${dashboardPath}/add-participant`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Add Participant
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {!participants || participants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="mb-6 px-4 py-2 bg-gray-100 text-gray-500 rounded-full inline-block font-black text-xs uppercase tracking-widest">
                None
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No participants yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first participant or upload multiple participants via CSV.
              </p>
              <Link
                href={`${dashboardPath}/add-participant`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Add Your First Participant
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-100">
            <ParticipantSearch participants={participants} />
          </div>
        )}
      </div>
    </div>
  );
}
