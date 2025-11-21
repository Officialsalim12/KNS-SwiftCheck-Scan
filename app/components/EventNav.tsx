'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EventNavProps {
  eventId: string;
}

export default function EventNav({ eventId }: EventNavProps) {
  const pathname = usePathname();
  const dashboardPath = `/admin/events/${eventId}/dashboard`;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-3">
          <Link
            href={dashboardPath}
            className={`inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              pathname === dashboardPath
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

