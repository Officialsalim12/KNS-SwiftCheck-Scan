import { getEvents } from '@/app/actions/events';
import Link from 'next/link';
import AccountManagement from '@/app/components/admin/AccountManagement';
import DeleteEventButton from '@/app/components/admin/DeleteEventButton';
import SuspendEventButton from '@/app/components/admin/SuspendEventButton';

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

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: events, error: eventError } = await getEvents();
  const currentTab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'events';

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
        {/* Hero Header */}
        <div className="mb-10 text-center">
          <div className="inline-block mb-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
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
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Global Administration
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Oversee system activity, monitor active attendance operations, and securely govern all organizational accounts from this centralized portal.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex gap-2 w-full max-w-md">
            <Link
              href="/admin?tab=events"
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                currentTab === 'events'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Event Monitor
            </Link>
            <Link
              href="/admin?tab=accounts"
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                currentTab === 'accounts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Accounts & Users
            </Link>
          </div>
        </div>

        {currentTab === 'accounts' ? (
          <div className="mb-12">
            <AccountManagement events={events || []} />
          </div>
        ) : (
          <>
        {/* Events List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Active System Events</h2>
              <p className="text-gray-600">
                {events && events.length > 0
                  ? `${events.length} event${events.length !== 1 ? 's' : ''} active`
                  : 'Waiting for organizations to initialize events'}
              </p>
            </div>
          </div>

          {eventError ? (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Error loading events</p>
                  <p className="text-sm">{eventError}</p>
                </div>
              </div>
            </div>
          ) : !events || events.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
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
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No System Events Found</h3>
                <p className="text-gray-600 mb-6">
                  When organizations register and deploy their campaigns, they will automatically populate here for monitoring.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <span className="text-white text-xs font-semibold uppercase tracking-wide">
                          {event.event_type || 'Event'}
                          {event.is_suspended && (
                            <span className="ml-2 text-amber-200">
                              • SUSPENDED
                            </span>
                          )}
                        </span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{event.name}</h3>
                      <p className="text-blue-100 text-sm">{event.organizations?.name || 'Organization'}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    )}

                    <div className="space-y-3 mb-6">
                      {event.location && (
                        <div className="flex items-start gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-700 text-sm">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-700 text-sm font-medium">
                          {formatEventDates(event.start_date, event.end_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/admin/events/${event.id}/dashboard`}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        Enter Analytics
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Link>
                      <SuspendEventButton eventId={event.id} isSuspended={event.is_suspended} />
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

