'use client';

import { useState } from 'react';
import { deleteEvent } from '@/app/actions/events';
import { useToast } from '@/lib/ToastContext';

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { error: toastError } = useToast();

  const handleDelete = async () => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this event? This action will obliterate all associated attendance logs and cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteEvent(eventId);
    if (result?.error) {
      toastError(result.error);
      setIsDeleting(false);
    }
    // On success, Next.js revalidatePath will refetch the page
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700 transition-all font-semibold shadow-sm hover:shadow transform hover:scale-[1.02] ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Delete Event"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
