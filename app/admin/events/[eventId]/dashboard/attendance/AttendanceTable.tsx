'use client';

import { useMemo, useState } from 'react';
import React from 'react';
import type { AttendanceLog } from './DownloadAttendanceButton';

interface AttendanceTableProps {
  logs: AttendanceLog[];
  eventName: string;
}

function getDateKey(dateString: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch {
    return '';
  }
}

function formatTimeOnly(value: string | null) {
  if (!value) return '';
  try {
    const date = new Date(value);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

type ParticipantDayData = {
  name: string;
  email: string;
  idNumber: string;
  organization: string;
  days: Map<number, { checkIn: string | null; checkOut: string | null; checkInTime: Date | null; checkOutTime: Date | null }>;
};

export default function AttendanceTable({ logs, eventName }: AttendanceTableProps) {
  const [query, setQuery] = useState('');

  // Process logs to group by participant and day
  const { participants, sortedDays } = useMemo(() => {
    // Get all unique dates from check-in times
    const dateSet = new Set<string>();
    logs.forEach((log) => {
      if (log.check_in_time) {
        const dateKey = getDateKey(log.check_in_time);
        if (dateKey) {
          dateSet.add(dateKey);
        }
      }
    });

    // Sort dates chronologically
    const sortedDates = Array.from(dateSet).sort();
    const dateToDayMap = new Map<string, number>();
    sortedDates.forEach((date, index) => {
      dateToDayMap.set(date, index + 1);
    });

    // Group logs by participant
    const participantMap = new Map<string, ParticipantDayData>();

    logs.forEach((log) => {
      const participantId = log.participants?.id_number || log.participants?.email || 'unknown';
      const dateKey = log.check_in_time ? getDateKey(log.check_in_time) : '';
      const dayNum = dateKey ? (dateToDayMap.get(dateKey) || 0) : 0;

      if (!participantMap.has(participantId)) {
        participantMap.set(participantId, {
          name: log.participants?.name ?? 'Unknown',
          email: log.participants?.email ?? '',
          idNumber: log.participants?.id_number ?? '',
          organization: log.participants?.organization ?? '',
          days: new Map(),
        });
      }

      const participant = participantMap.get(participantId)!;
      if (dayNum > 0) {
        if (!participant.days.has(dayNum)) {
          participant.days.set(dayNum, { checkIn: null, checkOut: null, checkInTime: null, checkOutTime: null });
        }

        const dayData = participant.days.get(dayNum)!;
        // Use first check-in time (earliest)
        if (log.check_in_time) {
          try {
            const checkInDate = new Date(log.check_in_time);
            if (!dayData.checkInTime || checkInDate < dayData.checkInTime) {
              dayData.checkInTime = checkInDate;
              dayData.checkIn = formatTimeOnly(log.check_in_time);
            }
          } catch {
            // If parsing fails, skip
          }
        }
        // Use last check-out time (latest)
        if (log.check_out_time) {
          try {
            const checkOutDate = new Date(log.check_out_time);
            if (!dayData.checkOutTime || checkOutDate > dayData.checkOutTime) {
              dayData.checkOutTime = checkOutDate;
              dayData.checkOut = formatTimeOnly(log.check_out_time);
            }
          } catch {
            // If parsing fails, skip
          }
        }
      }
    });

    return {
      participants: Array.from(participantMap.values()),
      sortedDays: sortedDates.map((_, index) => index + 1),
    };
  }, [logs]);

  const filteredParticipants = useMemo(() => {
    if (!query.trim()) {
      return participants;
    }

    const normalizedQuery = query.trim().toLowerCase();
    return participants.filter((participant) => {
      const fields = [
        participant.name,
        participant.email,
        participant.organization,
        participant.idNumber,
      ];
      return fields.some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [participants, query]);

  return (
    <div className="space-y-6">
      {/* Event Name in Block Letters */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-center shadow-lg">
        <h2 className="text-3xl font-bold text-white tracking-wider uppercase">
          {eventName}
        </h2>
      </div>

      <div className="relative">
        <label htmlFor="attendance-search" className="sr-only">
          Search attendance
        </label>
        <div className="relative">
          <input
            id="attendance-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, organization, or ID number..."
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
            No attendance records found
          </p>
          <p className="text-gray-500 text-sm">
            {query ? `No results for "${query}"` : 'Try searching with a different term'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <tr>
                  <th rowSpan={2} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">
                    Participant
                  </th>
                  <th rowSpan={2} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">
                    Organization
                  </th>
                  {sortedDays.map((dayNum) => (
                    <th
                      key={dayNum}
                      colSpan={2}
                      className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white border-l border-blue-500"
                    >
                      Day {dayNum}
                    </th>
                  ))}
                </tr>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-500">
                  {sortedDays.map((dayNum) => (
                    <React.Fragment key={dayNum}>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white border-l border-blue-400">
                        Check-In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Check-Out
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredParticipants.map((participant, index) => (
                  <tr key={`${participant.idNumber || participant.email}-${index}`} className="transition-colors hover:bg-blue-50/50">
                    <td className="whitespace-nowrap px-6 py-4 bg-white">
                      <div className="text-sm font-semibold text-gray-900">
                        {participant.name}
                      </div>
                      <div className="text-sm text-gray-500">{participant.email}</div>
                      {participant.idNumber && (
                        <div className="text-xs text-gray-400 mt-1">ID: {participant.idNumber}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {participant.organization || '-'}
                    </td>
                    {sortedDays.map((dayNum) => {
                      const dayData = participant.days.get(dayNum) || { checkIn: null, checkOut: null };
                      return (
                        <React.Fragment key={dayNum}>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 border-l border-gray-100">
                            {dayData.checkIn || '-'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                            {dayData.checkOut || '-'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


