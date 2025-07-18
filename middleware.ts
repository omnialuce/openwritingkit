import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/', '/editor', '/documents', '/outline', '/characters', '/plot-tools', '/ai-tools', '/analytics', '/settings', '/resources', '/feedback', '/stories'];
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('firebaseIdToken');

  // Handle the root path redirect
  if (pathname === '/') {
    if (sessionToken) {
      // If user is at root and logged in, let them stay (new dashboard)
      return NextResponse.next();
    }
    // If user is at root and not logged in, send to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (!sessionToken && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    // Exception for root, which is handled above
    if (pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect authenticated users from public routes (like login) to dashboard
  if (sessionToken && PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
