import { getAttendanceLogs } from '@/app/actions/attendance';
import { getEventById } from '@/app/actions/events';
import { DownloadAttendanceButton, type AttendanceLog } from './DownloadAttendanceButton';
import AttendanceTable from './AttendanceTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventAttendancePage({
  params,
}: {
  params: { eventId: string };
}) {
  const { data: logs, error } = await getAttendanceLogs(params.eventId);
  const { data: event } = await getEventById(params.eventId);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
            <p className="font-semibold">Error loading attendance</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Attendance Logs
                </h1>
                <p className="text-gray-600 text-lg">
                  Track and monitor participant attendance records
                </p>
                {logs && logs.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Total records: <span className="font-semibold text-blue-600">{logs.length}</span>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <DownloadAttendanceButton logs={logs ?? []} eventName={event?.name || 'Event'} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {!logs || logs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No attendance records yet</h3>
              <p className="text-gray-600">
                Attendance records will appear here once participants start checking in.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <AttendanceTable logs={logs as AttendanceLog[]} eventName={event?.name || 'Event'} />
          </div>
        )}
      </div>
    </div>
  );
}

