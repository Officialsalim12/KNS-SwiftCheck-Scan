'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getEventById, verifyEventCredentials } from './events';
import { checkAdminAuth } from '@/lib/auth';
import { getOrgSession } from '@/lib/org-auth';

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

export async function updateEventLocation(location: string) {
  const session = await getEventSession();
  if (!session) {
    return { error: 'No active session found' };
  }

  await setEventSession(session.eventId, session.username, location);
  return { success: true };
}

export async function checkEventAuth(eventId: string): Promise<boolean> {
  const session = await getEventSession();
  if (session?.eventId === eventId) return true;
  
  // 1. Global Admin pass-through override
  const isAdmin = await checkAdminAuth();
  if (isAdmin) return true;

  // 2. Organization Owner pass-through override
  const orgSession = await getOrgSession();
  if (orgSession) {
    const { data: event } = await getEventById(eventId);
    if (event && event.organization_id === orgSession.orgId) {
      return true;
    }
  }

  return false;
}

export async function requireEventAuth(eventId: string) {
  const isAuthenticated = await checkEventAuth(eventId);
  if (!isAuthenticated) {
    redirect(`/admin/events/${eventId}/login`);
  }
}

export async function requireOrgEventAuth(eventId: string) {
  const isAuthenticated = await checkEventAuth(eventId);
  if (!isAuthenticated) {
    redirect(`/org/dashboard/analytics/${eventId}/login`);
  }
}

export async function authenticateEventForAnalytics(formData: FormData) {
  const eventId = formData.get('eventId') as string;
  const username = formData.get('username') as string;
  const passkey = formData.get('passkey') as string;
  const location = formData.get('location') as string;

  if (!eventId || !username || !passkey) {
    return { error: 'Username and passkey are required' };
  }

  if (!location?.trim()) {
    return { error: 'Current location is required' };
  }

  const result = await verifyEventCredentials(username, passkey, eventId);

  if (!result.valid) {
    // Check if it's the username that's wrong or the password
    const { data: event } = await getEventById(eventId);
    if (event) {
      const allowedUsernames = [
        event.username,
        ...(event.event_users?.map((user: { username: string }) => user.username) ?? []),
      ].filter(Boolean);

      if (!allowedUsernames.includes(username.trim())) {
        return { error: 'Invalid user' };
      }
    }
    return { error: 'Invalid passkey' };
  }

  await setEventSession(eventId, username.trim(), location.trim());
  return { success: true };
}

export async function logout(formData: FormData) {
  await clearEventSession();
  const eventId = formData.get('eventId') as string;
  const source = formData.get('source') as string;
  
  if (source === 'org') {
    redirect(`/org/dashboard/analytics/${eventId}/login`);
  }
  redirect(`/admin/events/${eventId}/login`);
}

