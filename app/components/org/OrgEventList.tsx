'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { deleteEvent } from '@/app/actions/events';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/ToastContext';

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  is_suspended: boolean;
}

interface OrgEventListProps {
  events: Event[];
}

function formatDate(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DropdownMenu({ 
  eventId, 
  onDelete 
}: { 
  eventId: string; 
  onDelete: (id: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-xs font-bold text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors uppercase tracking-widest"
      >
        Options
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
          <Link
            href={`/org/dashboard/edit-event/${eventId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Edit Event
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              onDelete(eventId);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete Event
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrgEventList({ events }: OrgEventListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { error: toastError } = useToast();

  async function handleDelete(id: string) {
    if (!id) return;
    setIsDeleting(true);
    const result = await deleteEvent(id);
    if (result?.error) {
      toastError(result.error);
    }
    setIsDeleting(false);
    setDeletingId(null);
    router.refresh();
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
        <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-4 font-black text-xs uppercase tracking-widest">
          Empty
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-6">
          Get started by creating your first attendance tracking event for your organization.
        </p>
        <Link 
          href="/org/dashboard/new-event"
          className="hidden md:inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          New Event
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden flex flex-col">
            {/* Desktop Full Card Link (invisible layer) */}
            <Link 
              href={`/org/dashboard/analytics/${event.id}`}
              className="absolute inset-0 z-10 md:hidden"
            />
            
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  event.is_suspended ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {event.is_suspended ? 'Suspended' : (event.event_type || 'Event')}
                </span>
                <div className="z-20">
                  <DropdownMenu 
                    eventId={event.id} 
                    onDelete={(id) => setDeletingId(id)} 
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                {event.name}
              </h3>
              
              {event.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {event.location || 'Online / Remote'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {formatDate(event.start_date)} {event.end_date && ` - ${formatDate(event.end_date)}`}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 hidden md:block">
              <Link 
                href={`/org/dashboard/analytics/${event.id}`}
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all text-center shadow-sm hover:shadow-md"
              >
                View Analytics
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-600 rounded-full mb-6 mx-auto font-black text-xs uppercase tracking-widest">
              Danger
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Delete Event?</h3>
            <p className="text-center text-gray-600 mb-8">
              Are you sure you want to delete this event? This action cannot be undone and will remove all participant data and attendance logs.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
