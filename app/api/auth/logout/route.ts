import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);

  if (user) {
    // Increment tokenVersion to invalidate all existing tokens
    await prisma.user.update({
      where: { id: user.userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('auth-token');
  return response;
}
