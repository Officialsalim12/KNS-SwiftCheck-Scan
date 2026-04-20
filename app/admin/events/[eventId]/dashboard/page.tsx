import { getEventById } from '@/app/actions/events';
import { getParticipants } from '@/app/actions/participants';
import { getAttendanceLogs } from '@/app/actions/attendance';
import { getEventSession } from '@/app/actions/event-auth';
import EventDashboardView from '@/app/components/analytics/EventDashboardView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventDashboardPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { data: event } = await getEventById(params.eventId);
  const { data: participants } = await getParticipants(params.eventId);
  const { data: attendanceLogs } = await getAttendanceLogs(params.eventId);
  const session = await getEventSession();

  const canEdit = Boolean(
    session &&
    session.eventId === params.eventId &&
    session.username &&
    session.username === event?.username,
  );

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
      canEdit={canEdit}
      dashboardPath={`/admin/events/${params.eventId}/dashboard`}
    />
  );
}
