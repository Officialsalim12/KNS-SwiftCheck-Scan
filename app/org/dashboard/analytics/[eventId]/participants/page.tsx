import { getParticipants } from '@/app/actions/participants';
import { getEventById } from '@/app/actions/events';
import { getOrgSession } from '@/lib/org-auth';
import { requireOrgEventAuth } from '@/app/actions/event-auth';
import { redirect } from 'next/navigation';
import ParticipantsView from '@/app/components/analytics/ParticipantsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrgParticipantsPage({
  params,
}: {
  params: { eventId: string };
}) {
  await requireOrgEventAuth(params.eventId);

  // Parallel fetching of core data
  const [orgSession, eventData, participantsData] = await Promise.all([
    getOrgSession(),
    getEventById(params.eventId),
    getParticipants(params.eventId)
  ]);
  
  const { data: event, error: eventError } = eventData;
  const { data: participants } = participantsData;

  if (!orgSession) {
    redirect('/register');
  }
  
  if (eventError || !event || event.organization_id !== orgSession.orgId) {
    redirect('/org/dashboard');
  }

  return (
    <ParticipantsView 
      eventId={params.eventId} 
      participants={participants ?? []} 
      dashboardPath={`/org/dashboard/analytics/${params.eventId}`}
    />
  );
}
