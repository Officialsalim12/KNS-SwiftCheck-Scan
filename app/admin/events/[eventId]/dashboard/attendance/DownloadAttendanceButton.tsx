'use client';

type Participant = {
  name?: string | null;
  email?: string | null;
  organization?: string | null;
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

function convertToCsv(logs: AttendanceLog[]) {
  const headers = [
    'Participant Name',
    'Email',
    'Organization',
    'Check In',
    'Check Out',
    'Location',
    'Status',
  ];

  const rows = logs.map((log) => [
    log.participants?.name ?? 'Unknown',
    log.participants?.email ?? '',
    log.participants?.organization ?? '',
    formatDate(log.check_in_time),
    formatDate(log.check_out_time),
    log.location ?? '',
    log.check_out_time ? 'Checked Out' : 'Checked In',
  ]);

  return [headers, ...rows]
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

export function DownloadAttendanceButton({ logs }: { logs: AttendanceLog[] }) {
  const handleDownload = () => {
    if (!logs?.length) return;

    const csv = convertToCsv(logs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];

    link.href = url;
    link.download = `attendance-${date}.csv`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!logs?.length}
      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-4 w-4"
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

