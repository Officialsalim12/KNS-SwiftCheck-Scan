import { getParticipants } from '@/app/actions/participants';
import ParticipantsView from '@/app/components/analytics/ParticipantsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventParticipantsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { data: participants, error } = await getParticipants(params.eventId);

  return (
    <ParticipantsView 
      eventId={params.eventId} 
      participants={participants ?? []} 
      dashboardPath={`/admin/events/${params.eventId}/dashboard`}
    />
  );
}
