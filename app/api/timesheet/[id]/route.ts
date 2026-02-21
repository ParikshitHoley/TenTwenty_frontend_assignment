import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entryId = parseInt(id, 10);
    const db = getDb();

    const entry = db
      .prepare('SELECT * FROM timesheet_entries WHERE id = ?')
      .get(entryId);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
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
    const entryId = parseInt(id, 10);
    const body = await request.json();
    const {
      date,
      project_name,
      type_of_work,
      description,
      hours,
      week_id,
    } = body;

    const db = getDb();

    // Get the original entry
    const originalEntry = db
      .prepare('SELECT * FROM timesheet_entries WHERE id = ?')
      .get(entryId) as any;

    if (!originalEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const hoursDifference = hours - (originalEntry.hours || 0);

    // Check weekly hours limit
    const result = db
      .prepare('SELECT SUM(hours) as total FROM timesheet_entries WHERE week_id = ? AND id != ?')
      .get(week_id, entryId) as { total: number | null };

    const currentTotal = result?.total || 0;
    if (currentTotal + hours > 40) {
      return NextResponse.json(
        { error: 'Weekly hours limit exceeded (max 40 hours)' },
        { status: 400 }
      );
    }

    db.prepare(
      'UPDATE timesheet_entries SET date = ?, project_name = ?, type_of_work = ?, description = ?, hours = ? WHERE id = ?'
    ).run(date, project_name, type_of_work, description || null, hours, entryId);

    // Update week total and status
    const newWeekTotal = currentTotal + hours;
    let status = 'Incomplete';
    if (newWeekTotal === 40) status = 'Completed';
    else if (newWeekTotal === 0) status = 'Missing';

    db.prepare('UPDATE weeks SET total_hours = ?, status = ? WHERE id = ?').run(
      newWeekTotal,
      status,
      week_id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entryId = parseInt(id, 10);
    const db = getDb();

    const entry = db
      .prepare('SELECT week_id, hours FROM timesheet_entries WHERE id = ?')
      .get(entryId) as any;

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM timesheet_entries WHERE id = ?').run(entryId);

    // Update week total and status
    const result = db
      .prepare('SELECT SUM(hours) as total FROM timesheet_entries WHERE week_id = ?')
      .get(entry.week_id) as { total: number | null };

    const newWeekTotal = result?.total || 0;
    let status = 'Incomplete';
    if (newWeekTotal === 40) status = 'Completed';
    else if (newWeekTotal === 0) status = 'Missing';

    db.prepare('UPDATE weeks SET total_hours = ?, status = ? WHERE id = ?').run(
      newWeekTotal,
      status,
      entry.week_id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
