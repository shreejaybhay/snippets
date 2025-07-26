import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths
  const publicPaths = ["/login", "/signup", "/", "/learn", "/forgot-password", "/reset-password"];
  const isPublicPath = publicPaths.includes(path);
  
  // Get auth token
  const token = request.cookies.get("authToken")?.value || "";

  // Create base response with security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 1. Handle public snippet routes (allow public access)
  if (path.startsWith('/dashboard/s/')) {
    return response;
  }

  // 2. Protect all dashboard routes
  if (path.startsWith('/dashboard/')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Handle API endpoints
  if (path.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', '100');
    
    if (path === '/api/auth/me') {
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '-1');
    }

    return response;
  }

  // 4. Handle authentication redirects
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard/snippets", request.url));
  }

  return response;
}

// Update matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/',
    '/login',
    '/signup',
    '/learn',
    '/forgot-password',
    '/reset-password',
    '/dashboard/:path*',
    '/api/:path*'
  ]
};
