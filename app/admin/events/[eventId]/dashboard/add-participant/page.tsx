'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createParticipant } from '@/app/actions/participants';
import { getEventById } from '@/app/actions/events';
import { motion } from 'framer-motion';

export default function AddParticipant({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<{ event_type: string | null } | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await getEventById(params.eventId);
        if (error) {
          console.error('Error fetching event:', error);
        } else if (data) {
          setEvent(data);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoadingEvent(false);
      }
    }
    fetchEvent();
  }, [params.eventId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('event_id', params.eventId);
    const result = await createParticipant(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/events/${params.eventId}/dashboard/participants`);
      }, 2000);
    }
  }

  const eventType = event?.event_type?.toLowerCase();
  const showTableNumber = eventType === 'party' || eventType === 'marriage';

  return (
    <div className="px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8"
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Add New Participant</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter participant name"
            />
          </div>

          <div>
            <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-2">
              Participant ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="id_number"
              name="id_number"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a unique ID number (e.g., EMP-1001)"
            />
            <p className="text-xs text-gray-500 mt-2">
              This number will be tied to their QR code and can be used for manual check-in/out.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
              Organization
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter organization name"
            />
          </div>

          {showTableNumber && (
            <div>
              <label htmlFor="table_number" className="block text-sm font-medium text-gray-700 mb-2">
                Table Number
              </label>
              <input
                type="number"
                id="table_number"
                name="table_number"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter table number (optional)"
              />
              <p className="text-xs text-gray-500 mt-2">
                Optionally specify which table this participant will be seated at.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Participant created successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Participant'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

