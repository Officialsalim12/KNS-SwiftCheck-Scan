import { requireOrgEventAuth } from '@/app/actions/event-auth';
import AnalyticsClientLayout from '../AnalyticsClientLayout';

export default async function AnalyticsProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  await requireOrgEventAuth(params.eventId);
  
  return (
    <AnalyticsClientLayout>
      {children}
    </AnalyticsClientLayout>
  );
}
