'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEventCredentials } from '@/app/actions/events';
import { setEventSession } from '@/app/actions/event-auth';

export default function EventLogin({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string) || '';
    const password = (formData.get('password') as string) || '';
    const stationLocation = (formData.get('location') as string) || '';

    if (!stationLocation.trim()) {
      setError('Please provide your current location before continuing.');
      setIsLoading(false);
      return;
    }

    const { valid, event } = await verifyEventCredentials(username, password, params.eventId);

    if (!valid || !event || event.id !== params.eventId) {
      setError('Invalid username or password');
      setIsLoading(false);
      return;
    }

    await setEventSession(event.id, username.trim(), stationLocation.trim());
    router.push(`/admin/events/${event.id}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Event Login
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your event credentials to access the dashboard
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event username"
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
              placeholder="Enter event password"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Current Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Main Entrance or Hall B"
            />
            <p className="text-xs text-gray-500 mt-2">
              This location will be stamped on every check-in and check-out you perform.
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

