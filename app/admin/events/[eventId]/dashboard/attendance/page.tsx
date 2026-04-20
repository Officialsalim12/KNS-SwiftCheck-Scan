import { getAttendanceLogs } from '@/app/actions/attendance';
import { getEventById } from '@/app/actions/events';
import AttendanceView from '@/app/components/analytics/AttendanceView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventAttendancePage({
  params,
}: {
  params: { eventId: string };
}) {
  const { data: logs, error } = await getAttendanceLogs(params.eventId);
  const { data: event } = await getEventById(params.eventId);

  return (
    <AttendanceView 
      logs={logs ?? []} 
      event={event} 
      dashboardPath={`/admin/events/${params.eventId}/dashboard`}
      error={error} 
    />
  );
}
