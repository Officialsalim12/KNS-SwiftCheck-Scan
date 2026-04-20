import { getEventById } from '@/app/actions/events';
import { getParticipants } from '@/app/actions/participants';
import { getAttendanceLogs } from '@/app/actions/attendance';
import { getOrgSession } from '@/lib/org-auth';
import { requireOrgEventAuth } from '@/app/actions/event-auth';
import { redirect } from 'next/navigation';
import EventDashboardView from '@/app/components/analytics/EventDashboardView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrgAnalyticsPage({
  params,
}: {
  params: { eventId: string };
}) {
  // Parallel fetching of core data
  // Security authentication check explicitly called to prevent soft-navigation sweeps
  await requireOrgEventAuth(params.eventId);

  const [orgSession, eventData] = await Promise.all([
    getOrgSession(),
    getEventById(params.eventId)
  ]);

  const { data: event, error } = eventData;
  
  if (!orgSession) {
    redirect('/register');
  }
  
  if (error || !event) {
    redirect('/org/dashboard');
  }

  // Security Check: Verify ownership
  if (event.organization_id !== orgSession.orgId) {
    redirect('/org/dashboard');
  }

  // Fetch large datasets in parallel
  const [participantsData, attendanceData] = await Promise.all([
    getParticipants(params.eventId),
    getAttendanceLogs(params.eventId)
  ]);

  const participants = participantsData.data;
  const attendanceLogs = attendanceData.data;

  const totalParticipants = participants?.length || 0;
  const totalCheckIns = attendanceLogs?.length || 0;
  const currentlyCheckedIn = attendanceLogs?.filter((log: any) => !log.check_out_time).length || 0;
  const totalCheckOuts = attendanceLogs?.filter((log: any) => log.check_out_time).length || 0;

  return (
    <EventDashboardView
      eventId={params.eventId}
      event={event}
      totalParticipants={totalParticipants}
      totalCheckIns={totalCheckIns}
      currentlyCheckedIn={currentlyCheckedIn}
      totalCheckOuts={totalCheckOuts}
      canEdit={true}
      dashboardPath={`/org/dashboard/analytics/${params.eventId}`}
    />
  );
}
