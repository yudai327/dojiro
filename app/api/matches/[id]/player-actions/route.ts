import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// POST create player action
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = parseInt(params.id, 10);
    if (isNaN(matchId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.isDeleted) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const body = await req.json();
    const { playerId, actionType, result } = body;

    const VALID_ACTION_TYPES = ['attack', 'catch', 'cut'];
    const VALID_RESULTS = ['success', 'fail'];

    if (!VALID_ACTION_TYPES.includes(actionType)) {
      return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
    }
    if (!VALID_RESULTS.includes(result)) {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
    }

    const playerIdInt = parseInt(playerId, 10);
    if (isNaN(playerIdInt)) {
      return NextResponse.json({ error: 'Invalid playerId format' }, { status: 400 });
    }

    // Get player to find team
    const player = await prisma.player.findUnique({
      where: { id: playerIdInt },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Create player action
    const action = await prisma.playerAction.create({
      data: {
        matchId,
        teamId: player.teamId,
        playerId: playerIdInt,
        actionType,
        result,
      },
    });

    // Increment counters based on action
    const updateData: { [key: string]: { increment: number } } = {};
    if (actionType === 'attack') {
      updateData[result === 'success' ? 'attackSuccessCount' : 'attackFailCount'] = { increment: 1 };
    } else if (actionType === 'catch') {
      updateData[result === 'success' ? 'catchSuccessCount' : 'catchFailCount'] = { increment: 1 };
    } else if (actionType === 'cut') {
      updateData.cutCount = { increment: 1 };
    }

    // Use upsert to prevent race conditions on concurrent requests
    await prisma.playerMatchStats.upsert({
      where: { playerId_matchId: { playerId: playerIdInt, matchId } },
      create: {
        playerId: playerIdInt,
        matchId,
        attackSuccessCount: actionType === 'attack' && result === 'success' ? 1 : 0,
        attackFailCount: actionType === 'attack' && result === 'fail' ? 1 : 0,
        catchSuccessCount: actionType === 'catch' && result === 'success' ? 1 : 0,
        catchFailCount: actionType === 'catch' && result === 'fail' ? 1 : 0,
        cutCount: actionType === 'cut' ? 1 : 0,
      },
      update: updateData,
    });

    return NextResponse.json(action, { status: 201 });
  } catch (e) {
    console.error('error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET player actions for match
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = parseInt(params.id, 10);
    if (isNaN(matchId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.isDeleted) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const actions = await prisma.playerAction.findMany({
      where: { matchId },
    });
    return NextResponse.json(actions);
  } catch (e) {
    console.error('error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
