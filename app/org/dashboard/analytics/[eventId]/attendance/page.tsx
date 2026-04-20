import { getAttendanceLogs } from '@/app/actions/attendance';
import { getEventById } from '@/app/actions/events';
import { getOrgSession } from '@/lib/org-auth';
import { requireOrgEventAuth } from '@/app/actions/event-auth';
import { redirect } from 'next/navigation';
import AttendanceView from '@/app/components/analytics/AttendanceView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrgAttendancePage({
  params,
}: {
  params: { eventId: string };
}) {
  await requireOrgEventAuth(params.eventId);

  // Parallel fetching of core data
  const [orgSession, eventData, attendanceData] = await Promise.all([
    getOrgSession(),
    getEventById(params.eventId),
    getAttendanceLogs(params.eventId)
  ]);
  
  const { data: event, error: eventError } = eventData;
  const { data: attendanceLogs } = attendanceData;

  if (!orgSession) {
    redirect('/register');
  }
  
  if (eventError || !event || event.organization_id !== orgSession.orgId) {
    redirect('/org/dashboard');
  }

  return (
    <AttendanceView 
      logs={attendanceLogs ?? []} 
      event={event}
      dashboardPath={`/org/dashboard/analytics/${params.eventId}`}
    />
  );
}
