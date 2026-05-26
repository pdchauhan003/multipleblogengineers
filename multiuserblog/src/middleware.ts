import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require the user to be logged in
const protectedRoutes = ['/dashboard'];

// Routes only accessible when NOT logged in
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth tokens in cookies (adjust cookie names to match your Express backend)
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isLoggedIn = !!(accessToken || refreshToken);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Case A: Not logged in → trying to access a protected page → redirect to /login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case B: Already logged in → trying to access /login or /register → redirect to /dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes (handled by Express via proxy)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
