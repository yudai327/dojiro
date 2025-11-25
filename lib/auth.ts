import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  userId: number;
  email: string;
}

/**
 * Extract authenticated user from request headers
 * (Set by middleware after JWT verification)
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');

  if (!userId || !email) {
    return null;
  }

  return {
    userId: parseInt(userId, 10),
    email,
  };
}

/**
 * Middleware to require authentication on API routes
 * Usage in route handler:
 *
 * export async function GET(req: NextRequest) {
 *   const user = requireAuth(req);
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   // ... rest of handler
 * }
 */
export function requireAuth(request: NextRequest): AuthenticatedUser | null {
  return getAuthenticatedUser(request);
}

/**
 * Check if user is authorized for a specific action
 * Extend this with actual role/permission checks from database
 */
export async function canAccessResource(
  _userId: number,
  _resourceType: string,
  _resourceId?: number
): Promise<boolean> {
  // TODO: Implement actual permission checking
  // For now, any authenticated user can access
  return true;
}
