import { getOrgSession } from '@/lib/org-auth';
import { getEventById } from '@/app/actions/events';
import EditEventForm from '@/app/components/EditEventForm';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function EditEventPage({ params }: { params: { eventId: string } }) {
  const session = await getOrgSession();
  
  if (!session) return null;

  const { data: event, error } = await getEventById(params.eventId);

  if (error || !event) {
    notFound();
  }

  // Security check: Ensure this event belongs to the logged-in organization
  if (event.organization_id !== session.orgId) {
    redirect('/org/dashboard');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <Link 
          href="/org/dashboard" 
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-2 mb-4"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Event Settings</h1>
        <p className="text-gray-600 mt-2">
          Update the configuration and access credentials for <span className="font-bold text-gray-900">{event.name}</span>.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
        <EditEventForm event={event} successRedirect="/org/dashboard" />
      </div>
    </div>
  );
}
