import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { requireAuth, requireAdmin } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const teams = await prisma.team.findMany({ where: { isDeleted: false } });
    return NextResponse.json(teams);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const { name, category, organization } = body;

    const team = await prisma.team.create({
      data: { name, category, organization },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
