'use client';

type Participant = {
  name?: string | null;
  email?: string | null;
  organization?: string | null;
  id_number?: string | null;
};

export type AttendanceLog = {
  id: string;
  check_in_time: string | null;
  check_out_time: string | null;
  location?: string | null;
  participants?: Participant | null;
};

function formatDate(value: string | null) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
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

function getDateKey(dateString: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch {
    return '';
  }
}

function convertToCsv(logs: AttendanceLog[], eventName: string) {
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
  const maxDays = sortedDates.length;
  
  // Create a map from date to day number (Day1, Day2, etc.)
  const dateToDayMap = new Map<string, number>();
  sortedDates.forEach((date, index) => {
    dateToDayMap.set(date, index + 1);
  });
  
  // Create day headers (Day1, Day2, Day3, etc.)
  const dayHeaders: string[] = [];
  for (let i = 1; i <= maxDays; i++) {
    dayHeaders.push(`Day${i} Check-In`, `Day${i} Check-Out`);
  }

  // Main headers
  const headers = [
    'Participant Name',
    'Email',
    'ID Number',
    'Organization',
    ...dayHeaders,
  ];

  // Group logs by participant
  const participantMap = new Map<string, {
    name: string;
    email: string;
    idNumber: string;
    organization: string;
    days: Map<number, { checkIn: string | null; checkOut: string | null; checkInTime: Date | null; checkOutTime: Date | null }>;
  }>();

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

  // Create rows for each participant
  const rows = Array.from(participantMap.values()).map((participant) => {
    const row: string[] = [
      participant.name,
      participant.email,
      participant.idNumber,
      participant.organization,
    ];

    // Add check-in/check-out times for each day (Day1, Day2, etc.)
    for (let dayNum = 1; dayNum <= maxDays; dayNum++) {
      const dayData = participant.days.get(dayNum) || { checkIn: null, checkOut: null };
      row.push(dayData.checkIn || '');
      row.push(dayData.checkOut || '');
    }

    return row;
  });

  // Build CSV with event name header
  const eventNameRow = [`EVENT: ${eventName.toUpperCase()}`];
  const emptyRow: string[] = [];
  const csvRows = [
    eventNameRow,
    emptyRow,
    headers,
    ...rows,
  ];

  return csvRows
    .map((row) =>
      row
        .map((value) => {
          const cell = value ?? '';
          const needsQuotes = /[",\n]/.test(cell);
          const safeCell = cell.replace(/"/g, '""');
          return needsQuotes ? `"${safeCell}"` : safeCell;
        })
        .join(','),
    )
    .join('\r\n');
}

export function DownloadAttendanceButton({ 
  logs, 
  eventName 
}: { 
  logs: AttendanceLog[];
  eventName: string;
}) {
  const handleDownload = () => {
    if (!logs?.length) return;

    const csv = convertToCsv(logs, eventName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    const safeEventName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    link.href = url;
    link.download = `attendance-${safeEventName}-${date}.csv`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!logs?.length}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:transform-none disabled:shadow-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3"
        />
      </svg>
      Download Attendance
    </button>
  );
}
