'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const EVENT_SESSION_COOKIE = 'event_session';

export async function setEventSession(eventId: string) {
  const cookieStore = await cookies();
  cookieStore.set(EVENT_SESSION_COOKIE, eventId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getEventSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const eventId = cookieStore.get(EVENT_SESSION_COOKIE)?.value;
  return eventId || null;
}

export async function clearEventSession() {
  const cookieStore = await cookies();
  cookieStore.delete(EVENT_SESSION_COOKIE);
}

export async function checkEventAuth(eventId: string): Promise<boolean> {
  const sessionEventId = await getEventSession();
  return sessionEventId === eventId;
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

