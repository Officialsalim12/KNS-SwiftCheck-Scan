'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEvent } from '@/app/actions/events';

type EventUser = {
  id: string;
  username: string;
};

interface EditEventFormProps {
  event: {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    event_type?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    username: string;
    organizations?: { name?: string | null } | null;
    event_users?: EventUser[] | null;
  };
}

const EVENT_TYPES = ['Seminar', 'Workshop', 'Marriage', 'Party', 'Other'];

function formatDateInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasCustomType =
    event.event_type && !EVENT_TYPES.includes(event.event_type) ? true : false;
  const initialType = hasCustomType
    ? 'Other'
    : event.event_type
    ? (event.event_type as string)
    : 'Seminar';

  const [eventType, setEventType] = useState(initialType);
  const [otherEventType, setOtherEventType] = useState(
    hasCustomType ? event.event_type ?? '' : '',
  );

  const usernameDefaults = useMemo(() => {
    const existing = Array.from(
      new Set([
        event.username,
        ...(event.event_users?.map((user) => user.username) ?? []),
      ]),
    ).filter(Boolean);

    while (existing.length < 5) {
      existing.push('');
    }

    return existing.slice(0, 5);
  }, [event.username, event.event_users]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    if (eventType !== 'Other') {
      formData.set('event_type_other', '');
    } else {
      formData.set('event_type_other', otherEventType);
    }

    const result = await updateEvent(event.id, formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSuccess('Event updated successfully');
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Event Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={event.name}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
          <input
            type="text"
            id="organization_name"
            name="organization_name"
            defaultValue={event.organizations?.name ?? ''}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          defaultValue={event.location ?? ''}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          defaultValue={event.description ?? ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
            defaultValue={formatDateInput(event.start_date)}
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
            defaultValue={formatDateInput(event.end_date)}
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
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === 'Other' ? 'Other (specify below)' : type}
            </option>
          ))}
        </select>
      </div>

      {eventType === 'Other' && (
        <div>
          <label htmlFor="event_type_other" className="block text-sm font-medium text-gray-700 mb-2">
            Specify Event Type
          </label>
          <input
            type="text"
            id="event_type_other"
            name="event_type_other"
            value={otherEventType}
            onChange={(e) => setOtherEventType(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter custom event type"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Leave blank to keep current password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <p className="text-sm text-gray-500">
            Update the password to change access credentials for all usernames.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Usernames (up to 5 users share the same password)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usernameDefaults.map((value, index) => {
            const fieldName = index === 0 ? 'username' : `username_${index + 1}`;
            return (
              <input
                key={fieldName}
                type="text"
                id={fieldName}
                name={fieldName}
                defaultValue={value}
                required={index === 0}
                placeholder={index === 0 ? 'Primary username' : `Username ${index + 1}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            );
          })}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Primary username is required. Leave optional fields blank if not needed.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

