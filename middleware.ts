import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/api/auth/login', '/api/health', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For API routes, check JWT token
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      // Attach user info to request headers for use in route handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', String(decoded.userId));
      requestHeaders.set('x-user-email', decoded.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
  }

  // For page routes, allow access (could implement redirect to login here)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes except public ones
    '/api/:path*',
    // Match all page routes except public ones
    '/matches/:path*',
  ],
};
