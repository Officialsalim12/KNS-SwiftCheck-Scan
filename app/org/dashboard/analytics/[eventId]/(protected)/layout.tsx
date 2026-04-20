import { requireOrgEventAuth } from '@/app/actions/event-auth';
import OrgAnalyticsLayout from '../layout_component'; // I'll rename the current layout to a component

export default async function AnalyticsProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  await requireOrgEventAuth(params.eventId);
  
  return (
    <OrgAnalyticsLayout>
      {children}
    </OrgAnalyticsLayout>
  );
}
