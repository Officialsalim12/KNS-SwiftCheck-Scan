import { NextResponse } from 'next/server';
import { getEventSession } from '@/app/actions/event-auth';
import { getOrgSession } from '@/lib/org-auth';

export async function GET() {
  try {
    const [session, orgSession] = await Promise.all([
      getEventSession(),
      getOrgSession()
    ]);
    return NextResponse.json({ 
      session: session ?? null,
      isOrg: !!orgSession 
    });
  } catch (error) {
    console.error('Failed to load event session:', error);
    return NextResponse.json({ session: null, error: 'Unable to load session' }, { status: 500 });
  }
}

