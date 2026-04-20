import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if we are on an analytics page for an organization
  // Path: /org/dashboard/analytics/[eventId]/...(anything)
  const match = pathname.match(/^\/org\/dashboard\/analytics\/([^\/]+)/);
  
  if (match) {
    const eventId = match[1];
    
    // Forward the pathname as a header so server layouts can detect the current route
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    
    // Skip protection for the login page itself
    if (pathname.endsWith('/login')) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Check for admin-auth cookie (allow bypass)
    const adminAuth = request.cookies.get('admin-auth');
    if (adminAuth?.value === 'authenticated') {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Check for the event_session cookie
    const eventSession = request.cookies.get('event_session');

    if (!eventSession) {
      return NextResponse.redirect(new URL(`/org/dashboard/analytics/${eventId}/login`, request.url));
    }

    try {
      const session = JSON.parse(eventSession.value);
      if (session.eventId !== eventId) {
        return NextResponse.redirect(new URL(`/org/dashboard/analytics/${eventId}/login`, request.url));
      }
    } catch (e) {
      // Legacy cookie or invalid format
      if (eventSession.value !== eventId) {
        return NextResponse.redirect(new URL(`/org/dashboard/analytics/${eventId}/login`, request.url));
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/org/dashboard/analytics/:path*'],
};
