'use client';

import { useState, useRef } from 'react';
import { createEvent } from '@/app/actions/events';
import { useRouter } from 'next/navigation';

export default function EventForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState('Seminar');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = formRef.current;
    if (!form) {
      setIsLoading(false);
      return;
    }

    const formData = new FormData(form);
    const result = await createEvent(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      form.reset();
      setEventType('Seminar');
      setIsLoading(false);
      router.refresh();
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter event name"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Event Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter event location"
        />
      </div>

      <div>
        <label
          htmlFor="organization_name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Organization
        </label>
        <input
          type="text"
          id="organization_name"
          name="organization_name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter organization name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter event description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter primary username for event access"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter password for event access"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Usernames (Optional, up to 4 more)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[2, 3, 4, 5].map((num) => (
            <input
              key={num}
              type="text"
              id={`username_${num}`}
              name={`username_${num}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Username ${num}`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          All usernames share the same password. Leave blank if not needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date (Optional)
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
          Event Type
        </label>
        <select
          id="event_type"
          name="event_type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Seminar">Seminar</option>
          <option value="Workshop">Workshop</option>
          <option value="Marriage">Marriage</option>
          <option value="Party">Party</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {eventType === 'Other' && (
        <div>
          <label
            htmlFor="event_type_other"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Specify Event Type
          </label>
          <input
            type="text"
            id="event_type_other"
            name="event_type_other"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter custom event type"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {isLoading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

