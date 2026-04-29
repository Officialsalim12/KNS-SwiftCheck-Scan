'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusSquare, BarChart3, User, Settings, Users, Calendar, LogOut } from 'lucide-react';
import { logoutOrganization } from '@/app/actions/organizations';
import { logout as systemLogout } from '@/app/actions/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  action?: () => void;
}

import { useState } from 'react';
import ConfirmationModal from './ui/ConfirmationModal';

interface BottomNavProps {
  explicitEventId?: string | null;
  explicitIsOrg?: boolean;
}

export default function BottomNav({ explicitEventId, explicitIsOrg }: BottomNavProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutType, setLogoutType] = useState<'org' | 'system' | null>(null);

  const handleLogoutClick = (type: 'org' | 'system') => {
    setLogoutType(type);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    if (logoutType === 'org') {
      await logoutOrganization();
    } else if (logoutType === 'system') {
      await systemLogout();
    }
  };

  // Determine context
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // 1. Event View (Event Dashboard - either admin or org analytics)
  const isOrgAnalytics = explicitIsOrg ?? (pathSegments[0] === 'org' && pathSegments[1] === 'dashboard' && pathSegments[2] === 'analytics' && pathSegments[3]);
  const isEventDashboard = !explicitIsOrg && (pathSegments[0] === 'admin' && pathSegments[1] === 'events' && pathSegments[3] === 'dashboard');
  const isEventView = explicitEventId ? true : (isOrgAnalytics || isEventDashboard);
  
  // 2. System Admin (Global View)
  const isSystemAdmin = !explicitEventId && (pathSegments[0] === 'admin' && pathSegments.length === 1);
  
  // 3. Organization Dashboard (Global View)
  const isOrgDashboard = !explicitEventId && (pathSegments[0] === 'org' && pathSegments[1] === 'dashboard' && !pathSegments[2]);
  
  const eventId = explicitEventId || (isOrgAnalytics ? pathSegments[3] : (isEventDashboard ? pathSegments[2] : null));

  const orgNavItems: NavItem[] = [
    {
      label: 'Events',
      href: '/org/dashboard',
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      label: 'New Event',
      href: '/org/dashboard/new-event',
      icon: <PlusSquare className="w-6 h-6" />,
    },
    {
      label: 'Analytics',
      href: '/org/dashboard/analytics',
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      label: 'Sign Out',
      href: '#',
      icon: <LogOut className="w-6 h-6" />,
      action: () => handleLogoutClick('org'),
    },
  ];

  const eventBasePath = isOrgAnalytics 
    ? `/org/dashboard/analytics/${eventId}` 
    : `/admin/events/${eventId}/dashboard`;

  const eventNavItems: NavItem[] = eventId ? [
    {
      label: 'Overview',
      href: eventBasePath,
      icon: <Home className="w-6 h-6" />,
    },
    {
      label: 'Participants',
      href: `${eventBasePath}/participants`,
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: 'Attendance',
      href: `${eventBasePath}/attendance`,
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      label: 'Settings',
      href: `${eventBasePath}/settings`,
      icon: <Settings className="w-6 h-6" />,
    },
    {
      label: 'Sign Out',
      href: '#',
      icon: <LogOut className="w-6 h-6" />,
      action: () => handleLogoutClick(isOrgAnalytics ? 'org' : 'system'),
    },
  ] : [];

  const systemAdminNavItems: NavItem[] = [
    {
      label: 'Monitor',
      href: '/admin?tab=events',
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      label: 'Accounts',
      href: '/admin?tab=accounts',
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: 'Sign Out',
      href: '#',
      icon: <LogOut className="w-6 h-6" />,
      action: () => handleLogoutClick('system'),
    },
  ];

  let items: NavItem[] = [];
  if (isEventView) {
    items = eventNavItems;
  } else if (isSystemAdmin) {
    items = systemAdminNavItems;
  } else {
    items = orgNavItems;
  }

  if (items.length === 0) return null;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 pb-[env(safe-area-inset-bottom)] px-4">
        <div className="flex justify-around items-center h-16">
          {items.map((item) => {
            const isActive = item.href === '#' ? false : (pathname === item.href || (item.href !== '/org/dashboard' && pathname.startsWith(item.href)));
            
            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`mobile-nav-item ${isActive ? 'mobile-nav-active' : 'mobile-nav-inactive'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'mobile-nav-active' : 'mobile-nav-inactive'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
