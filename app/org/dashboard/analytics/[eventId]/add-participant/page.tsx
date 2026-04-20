import { getOrgSession } from '@/lib/org-auth';
import { getEventById } from '@/app/actions/events';
import { requireOrgEventAuth } from '@/app/actions/event-auth';
import { redirect } from 'next/navigation';
import AddParticipantView from '@/app/components/analytics/AddParticipantView';

export default async function OrgAddParticipantPage({
  params,
}: {
  params: { eventId: string };
}) {
  await requireOrgEventAuth(params.eventId);

  const [orgSession, eventData] = await Promise.all([
    getOrgSession(),
    getEventById(params.eventId)
  ]);
  
  const { data: event, error: eventError } = eventData;
  
  if (!orgSession) {
    redirect('/register');
  }
  
  if (eventError || !event || event.organization_id !== orgSession.orgId) {
    redirect('/org/dashboard');
  }

  return (
    <AddParticipantView 
      eventId={params.eventId} 
      dashboardPath={`/org/dashboard/analytics/${params.eventId}`} 
    />
  );
}
