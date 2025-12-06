'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const EVENT_SESSION_COOKIE = 'event_session';

export type EventSession = {
  eventId: string;
  username: string;
  location?: string | null;
};

function serializeSession(session: EventSession) {
  return JSON.stringify(session);
}

function deserializeSession(value?: string | null): EventSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.eventId && parsed?.username) {
      return {
        eventId: parsed.eventId,
        username: parsed.username,
        location: parsed.location ?? null,
      };
    }
  } catch {
    // Legacy cookie: value stored as plain eventId string
    if (typeof value === 'string') {
      return { eventId: value, username: '', location: null };
    }
  }
  return null;
}

export async function setEventSession(eventId: string, username: string, location: string) {
  const cookieStore = await cookies();
  const payload = serializeSession({
    eventId,
    username,
    location: location?.trim() || null,
  });
  cookieStore.set(EVENT_SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getEventSession(): Promise<EventSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  return deserializeSession(value);
}

export async function clearEventSession() {
  const cookieStore = await cookies();
  cookieStore.delete(EVENT_SESSION_COOKIE);
}

export async function checkEventAuth(eventId: string): Promise<boolean> {
  const session = await getEventSession();
  return session?.eventId === eventId;
}

export async function requireEventAuth(eventId: string) {
  const isAuthenticated = await checkEventAuth(eventId);
  if (!isAuthenticated) {
    redirect(`/admin/events/${eventId}/login`);
  }
}

export async function logout(formData: FormData) {
  await clearEventSession();
  const eventId = formData.get('eventId') as string;
  redirect(`/admin/events/${eventId}/login`);
}

