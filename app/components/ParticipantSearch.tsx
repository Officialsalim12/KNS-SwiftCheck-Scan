'use client';

import { useMemo, useState } from 'react';
import ParticipantCard from './ParticipantCard';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  qr_code_url?: string;
  photo_url?: string;
  created_at: string;
  id_number?: string;
  table_number?: number | null;
  event_id: string;
}

interface ParticipantSearchProps {
  participants: Participant[];
}

export default function ParticipantSearch({ participants }: ParticipantSearchProps) {
  const [query, setQuery] = useState('');

  const filteredParticipants = useMemo(() => {
    if (!query.trim()) {
      return participants;
    }

    const normalizedQuery = query.trim().toLowerCase();
    return participants.filter((participant) => {
      const nameMatch = participant.name?.toLowerCase().includes(normalizedQuery);
      const idMatch = participant.id_number?.toLowerCase().includes(normalizedQuery);
      return nameMatch || idMatch;
    });
  }, [participants, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <label htmlFor="participant-search" className="sr-only">
          Search participants
        </label>
        <div className="relative">
          <input
            id="participant-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or ID number..."
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 pl-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 focus:bg-white transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-4.35-4.35M5 11a6 6 0 1 0 12 0 6 6 0 0 0-12 0Z"
            />
          </svg>
        </div>
        {query && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {filteredParticipants.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 font-medium text-lg mb-1">
            No participants found
          </p>
          <p className="text-gray-500 text-sm">
            {query ? `No results for "${query}"` : 'Try searching with a different term'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ gridAutoRows: '1fr' }}>
          {filteredParticipants.map((participant) => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))}
        </div>
      )}
    </div>
  );
}


