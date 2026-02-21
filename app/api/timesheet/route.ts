import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      week_id,
      date,
      project_name,
      type_of_work,
      description,
      hours,
    } = body;

    if (!week_id || !date || !project_name || !type_of_work || !hours) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check weekly hours limit
    const result = db
      .prepare('SELECT SUM(hours) as total FROM timesheet_entries WHERE week_id = ?')
      .get(week_id) as { total: number | null };

    const currentTotal = result?.total || 0;
    if (currentTotal + hours > 40) {
      return NextResponse.json(
        { error: 'Weekly hours limit exceeded (max 40 hours)' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(
      'INSERT INTO timesheet_entries (week_id, date, project_name, type_of_work, description, hours) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertResult = stmt.run(
      week_id,
      date,
      project_name,
      type_of_work,
      description || null,
      hours
    );

    // Update week total and status
    const newTotal = currentTotal + hours;
    let status = 'Incomplete';
    if (newTotal === 40) status = 'Completed';
    else if (newTotal === 0) status = 'Missing';

    db.prepare('UPDATE weeks SET total_hours = ?, status = ? WHERE id = ?').run(
      newTotal,
      status,
      week_id
    );

    return NextResponse.json(
      {
        id: insertResult.lastInsertRowid,
        week_id,
        date,
        project_name,
        type_of_work,
        description,
        hours,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weekId = searchParams.get('weekId');

    if (!weekId) {
      return NextResponse.json(
        { error: 'weekId parameter required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const entries = db
      .prepare('SELECT * FROM timesheet_entries WHERE week_id = ? ORDER BY date')
      .all(weekId);

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
