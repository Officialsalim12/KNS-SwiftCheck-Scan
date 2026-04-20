import { checkEventAuth } from '@/app/actions/event-auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AnalyticsClientLayout from './AnalyticsClientLayout';

export default async function OrgAnalyticsServerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  // Read the incoming path from headers so we can detect the login sub-route
  // and avoid an infinite redirect loop on the login page itself.
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || 
                   headersList.get('x-pathname') || 
                   '';
  
  const isLoginPage = pathname.endsWith('/login');

  if (!isLoginPage) {
    const isAuthenticated = await checkEventAuth(params.eventId);
    if (!isAuthenticated) {
      redirect(`/org/dashboard/analytics/${params.eventId}/login`);
    }
  }

  return (
    <AnalyticsClientLayout>
      {children}
    </AnalyticsClientLayout>
  );
}
