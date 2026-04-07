import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const matchId = parseInt(params.id, 10);
    const body = await req.json();
    const { playerId, actionType, result } = body;

    const player = await prisma.player.findUnique({
      where: { id: parseInt(playerId, 10) },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const action = await prisma.playerAction.create({
      data: {
        matchId,
        teamId: player.teamId,
        playerId: player.id,
        actionType,
        result,
      },
    });

    let stats = await prisma.playerMatchStats.findFirst({
      where: { playerId: player.id, matchId },
    });

    if (!stats) {
      stats = await prisma.playerMatchStats.create({
        data: {
          playerId: player.id,
          matchId,
          attackSuccessCount: 0,
          attackFailCount: 0,
          catchSuccessCount: 0,
          catchFailCount: 0,
          cutCount: 0,
        },
      });
    }

    const updateData: { [key: string]: { increment: number } } = {};
    if (actionType === 'attack') {
      updateData[result === 'success' ? 'attackSuccessCount' : 'attackFailCount'] = { increment: 1 };
    } else if (actionType === 'catch') {
      updateData[result === 'success' ? 'catchSuccessCount' : 'catchFailCount'] = { increment: 1 };
    } else if (actionType === 'cut') {
      updateData.cutCount = { increment: 1 };
    }

    await prisma.playerMatchStats.update({
      where: { id: stats.id },
      data: updateData,
    });

    return NextResponse.json(action, { status: 201 });
  } catch (e) {
    console.error('error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const matchId = parseInt(params.id, 10);
    const actions = await prisma.playerAction.findMany({
      where: { matchId },
    });
    return NextResponse.json(actions);
  } catch (e) {
    console.error('error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
