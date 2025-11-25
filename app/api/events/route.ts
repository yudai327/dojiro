import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET all events
export async function GET(req: NextRequest) {
  try {
    const events = await prisma.event.findMany({ where: { isDeleted: false } });
    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST create event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, eventType, startDate, endDate, venue, note } = body;

    const event = await prisma.event.create({
      data: {
        name,
        eventType: eventType || 'tournament',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        venue,
        note,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
