import { NextRequest, NextResponse } from 'next/server';

export type UserRole = 'admin' | 'viewer';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: UserRole;
}

/**
 * Extract authenticated user from request headers
 * (Set by middleware after JWT verification)
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role') as UserRole | null;

  if (!userId || !email || !role) {
    return null;
  }

  return {
    userId: parseInt(userId, 10),
    email,
    role,
  };
}

export function requireAuth(request: NextRequest): AuthenticatedUser | null {
  return getAuthenticatedUser(request);
}

/**
 * Require admin role. Returns 403 response if not admin.
 */
export function requireAdmin(request: NextRequest): AuthenticatedUser | NextResponse {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

/**
 * Check if user has permission for a resource/action.
 * Roles: admin = full access, viewer = read-only
 */
export function canAccessResource(
  user: AuthenticatedUser,
  action: 'read' | 'write'
): boolean {
  if (action === 'read') return true;
  return user.role === 'admin';
}
