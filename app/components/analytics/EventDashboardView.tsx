import Link from 'next/link';

interface Props {
  eventId: string;
  event: any;
  totalParticipants: number;
  totalCheckIns: number;
  currentlyCheckedIn: number;
  totalCheckOuts: number;
  canEdit: boolean;
  dashboardPath: string; // e.g. "/admin/events/[eventId]/dashboard" or "/org/dashboard/analytics/[eventId]"
}

export default function EventDashboardView({
  eventId,
  event,
  totalParticipants,
  totalCheckIns,
  currentlyCheckedIn,
  totalCheckOuts,
  canEdit,
  dashboardPath,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header Section - Desktop Only */}
        <div className="hidden md:block mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="sr-only">
                Event Dashboard
              </h1>
              <p className="text-base md:text-lg text-gray-600">Monitor and manage your event participants and attendance in real-time</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-blue-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Participants</p>
                <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {totalParticipants}
                </p>
                <p className="text-xs text-gray-400 mt-2">Registered attendees</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Check Ins</p>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {totalCheckIns}
                </p>
                <p className="text-xs text-gray-400 mt-2">All time check ins</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-purple-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Checked Out</p>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {totalCheckOuts}
                </p>
                <p className="text-xs text-gray-400 mt-2">Completed sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Check In / Check Out Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link
            href="/checkin"
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 shadow-xl transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative px-8 py-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Check In</h3>
                  <p className="text-green-100 text-sm">Scan QR code to check in participants</p>
                </div>
              </div>
            </div>
          </Link>
          <Link
            href="/checkout"
            className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 shadow-xl transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative px-8 py-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Check Out</h3>
                  <p className="text-red-100 text-sm">Scan QR code to check out participants</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href={`${dashboardPath}/participants`}
              className="hidden md:block group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-blue-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="hidden md:block bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 shadow-md group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Participants</h3>
                  <p className="text-gray-600 text-sm">View and manage all participants</p>
                  <div className="mt-4 hidden md:flex items-center text-blue-600 text-sm font-semibold">
                    <span>View all</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href={`${dashboardPath}/add-participant`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-green-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="hidden md:block bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 shadow-md group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Add Participant</h3>
                  <p className="text-gray-600 text-sm">Register a new participant</p>
                  <div className="mt-4 hidden md:flex items-center text-green-600 text-sm font-semibold">
                    <span>Add now</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href={`${dashboardPath}/attendance`}
              className="hidden md:block group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-purple-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="hidden md:block bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 shadow-md group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Attendance</h3>
                  <p className="text-gray-600 text-sm">View attendance logs and records</p>
                  <div className="mt-4 hidden md:flex items-center text-purple-600 text-sm font-semibold">
                    <span>View logs</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
