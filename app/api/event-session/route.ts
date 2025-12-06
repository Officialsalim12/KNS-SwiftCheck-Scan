import { NextResponse } from 'next/server';
import { getEventSession } from '@/app/actions/event-auth';

export async function GET() {
  try {
    const session = await getEventSession();
    return NextResponse.json({ session: session ?? null });
  } catch (error) {
    console.error('Failed to load event session:', error);
    return NextResponse.json({ session: null, error: 'Unable to load session' }, { status: 500 });
  }
}

