import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { requireAuth, requireAdmin } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const matches = await prisma.match.findMany({
      where: { isDeleted: false },
      include: { event: true },
    });
    return NextResponse.json(matches);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const { eventId, date, startTime, court, teamHomeId, teamAwayId, youtubeUrl, note } = body;

    const match = await prisma.match.create({
      data: {
        eventId,
        date: date ? new Date(date) : null,
        startTime: startTime ? new Date(startTime) : null,
        court,
        teamHomeId,
        teamAwayId,
        youtubeUrl,
        note,
        status: 'scheduled',
      },
      include: { event: true },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
