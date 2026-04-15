import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const matchId = parseInt(params.id, 10);
    const stats = await prisma.playerMatchStats.findMany({
      where: { matchId },
    });

    const enriched = await Promise.all(
      stats.map(async (s: typeof stats[0]) => {
        const player = await prisma.player.findUnique({ where: { id: s.playerId } });
        const attackAttempt = (s.attackSuccessCount || 0) + (s.attackFailCount || 0);
        const catchAttempt =
          (s.catchSuccessCount || 0) + (s.catchFailCount || 0) + (s.cutCount || 0);
        return {
          playerId: s.playerId,
          playerName: player?.name || 'Unknown',
          attackSuccessCount: s.attackSuccessCount || 0,
          attackFailCount: s.attackFailCount || 0,
          catchSuccessCount: s.catchSuccessCount || 0,
          catchFailCount: s.catchFailCount || 0,
          cutCount: s.cutCount || 0,
          attackRate: attackAttempt > 0 ? (s.attackSuccessCount || 0) / attackAttempt : 0,
          catchRate:
            catchAttempt > 0
              ? ((s.catchSuccessCount || 0) + (s.cutCount || 0)) / catchAttempt
              : 0,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (e) {
    console.error('error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
