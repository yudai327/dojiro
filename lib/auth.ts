import { NextRequest, NextResponse } from 'next/server';
import prisma from './prisma';

export type UserRole = 'admin' | 'viewer';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: UserRole;
}

/**
 * Extract and validate authenticated user from request headers.
 * Checks tokenVersion against DB to support token invalidation on logout.
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role') as UserRole | null;
  const tokenVersion = request.headers.get('x-token-version');

  if (!userId || !email || !role || tokenVersion === null) {
    return null;
  }

  // Verify tokenVersion matches DB (invalidates tokens after logout)
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
    select: { tokenVersion: true, isActive: true },
  });

  if (!user || !user.isActive || user.tokenVersion !== parseInt(tokenVersion, 10)) {
    return null;
  }

  return { userId: parseInt(userId, 10), email, role };
}

/**
 * Require admin role. Returns 403 response if not admin.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const user = await requireAuth(request);
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
 * viewer = read-only, admin = full access
 */
export function canAccessResource(
  user: AuthenticatedUser,
  action: 'read' | 'write'
): boolean {
  if (action === 'read') return true;
  return user.role === 'admin';
}
