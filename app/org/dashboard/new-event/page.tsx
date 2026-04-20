import { getOrgSession } from '@/lib/org-auth';
import EventForm from '@/app/components/EventForm';
import Link from 'next/link';

export default async function NewEventPage() {
  const session = await getOrgSession();
  
  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <Link 
          href="/org/dashboard" 
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-2 mb-4"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Initialize a new attendance tracking campaign for your organization.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
        <EventForm defaultOrgName={session.name} />
      </div>
    </div>
  );
}
