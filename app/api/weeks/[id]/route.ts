import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const weekId = parseInt(id, 10);
    const db = getDb();

    const week = db
      .prepare('SELECT * FROM weeks WHERE id = ? AND user_id = 1')
      .get(weekId);

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    const entries = db
      .prepare('SELECT * FROM timesheet_entries WHERE week_id = ? ORDER BY date')
      .all(weekId);

    return NextResponse.json({ week, entries });
  } catch (error) {
    console.error('Error fetching week:', error);
    return NextResponse.json(
      { error: 'Failed to fetch week' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const weekId = parseInt(id, 10);
    const body = await request.json();
    const { status, total_hours } = body;

    const db = getDb();

    db.prepare('UPDATE weeks SET status = ?, total_hours = ? WHERE id = ?').run(
      status,
      total_hours,
      weekId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { error: 'Failed to update week' },
      { status: 500 }
    );
  }
}
