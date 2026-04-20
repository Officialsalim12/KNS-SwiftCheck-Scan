import AddParticipantView from '@/app/components/analytics/AddParticipantView';

export default function AddParticipantPage({ params }: { params: { eventId: string } }) {
  return (
    <AddParticipantView 
      eventId={params.eventId} 
      dashboardPath={`/admin/events/${params.eventId}/dashboard`} 
    />
  );
}
