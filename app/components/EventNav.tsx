'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EventNavProps {
  eventId: string;
  canEdit?: boolean;
}

export default function EventNav({ eventId, canEdit = false }: EventNavProps) {
  const pathname = usePathname();
  const dashboardPath = `/admin/events/${eventId}/dashboard`;
  const settingsPath = `${dashboardPath}/settings`;

  const navItems = [
    {
      href: dashboardPath,
      label: 'Dashboard',
      icon: (
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
      ),
    },
    ...(canEdit
      ? [
        {
          href: settingsPath,
          label: 'Settings',
          icon: (
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
                d="M11 11V7a1 1 0 112 0v4a1 1 0 01-1 1H7a1 1 0 110-2h4zm-7 0a9 9 0 1018 0 9 9 0 00-18 0z"
              />
            </svg>
          ),
        },
      ]
      : []),
  ] as const;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-4 py-3 md:px-6 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

