import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Protected routes
  const protectedRoutes = ['/dashboard'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Detect returning from OAuth success
  const isOauthSuccess = request.nextUrl.searchParams.get('auth') === 'success';

  // Use a lightweight client cookie that indicates an active session
  const clientAuth = request.cookies.get('client_auth');
  const refreshToken = request.cookies.get('refresh_token');

  console.log('Middleware check:', {
    pathname,
    isOauthSuccess,
    hasClientAuth: !!clientAuth,
    hasRefreshToken: !!refreshToken,
    isProtectedRoute,
    isPublicRoute
  });

  // If OAuth success, allow access to dashboard regardless of client_auth cookie
  // This gives time for the client-side auth flow to complete
  if (isOauthSuccess && pathname === '/dashboard') {
    console.log('OAuth success detected, allowing dashboard access');
    return NextResponse.next();
  }

  // If accessing protected route without session indicator and no OAuth success, redirect to login
  if (isProtectedRoute && !clientAuth && !refreshToken && !isOauthSuccess) {
    console.log('Redirecting to login - no auth cookies');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing public route with active session, redirect to dashboard
  if (isPublicRoute && (clientAuth || refreshToken) && pathname !== '/login') {
    console.log('Redirecting to dashboard - user already authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
