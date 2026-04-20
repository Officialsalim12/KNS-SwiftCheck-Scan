import { cookies } from 'next/headers';

const ORG_SESSION_COOKIE = 'org_session';

export type OrgSession = {
  orgId: string;
  name: string;
  email: string;
};

function serializeSession(session: OrgSession) {
  return JSON.stringify(session);
}

function deserializeSession(value?: string | null): OrgSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.orgId && parsed?.email) {
      return {
        orgId: parsed.orgId,
        name: parsed.name,
        email: parsed.email,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function setOrgSession(orgId: string, name: string, email: string) {
  const cookieStore = await cookies();
  const payload = serializeSession({
    orgId,
    name,
    email,
  });
  cookieStore.set(ORG_SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getOrgSession(): Promise<OrgSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ORG_SESSION_COOKIE)?.value;
  return deserializeSession(value);
}

export async function clearOrgSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ORG_SESSION_COOKIE);
}

export async function checkOrgAuth(): Promise<boolean> {
  const session = await getOrgSession();
  return !!session;
}
