import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET all teams
export async function GET(req: NextRequest) {
  try {
    const teams = await prisma.team.findMany({ where: { isDeleted: false } });
    return NextResponse.json(teams);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST create team
export async function POST(req: NextRequest) {
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
