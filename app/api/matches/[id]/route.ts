import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = params;

    const match = await prisma.match.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        event: true,
        teamHome: {
          include: {
            players: {
              orderBy: { uniformNumber: 'asc' },
            },
          },
        },
        teamAway: {
          include: {
            players: {
              orderBy: { uniformNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('GET /api/matches/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
