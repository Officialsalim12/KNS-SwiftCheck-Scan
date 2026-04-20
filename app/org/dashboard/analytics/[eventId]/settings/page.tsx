import { getOrgSession } from '@/lib/org-auth';
import { getEventById } from '@/app/actions/events';
import { requireOrgEventAuth } from '@/app/actions/event-auth';
import EditEventForm from '@/app/components/EditEventForm';
import { redirect } from 'next/navigation';

export default async function OrgEventSettingsPage({
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
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Event Settings</h2>
          <p className="text-gray-500">Update your event details and security passkey</p>
        </div>
        <div className="p-6 sm:p-8">
          <EditEventForm 
            event={event} 
            successRedirect={`/org/dashboard/analytics/${params.eventId}`}
          />
        </div>
      </div>
    </div>
  );
}
