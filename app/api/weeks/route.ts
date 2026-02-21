import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const db = getDb();
    let query = 'SELECT * FROM weeks WHERE user_id = 1';
    const params: any[] = [];

    const conditions: string[] = [];

    if (startDate) {
      conditions.push('start_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('end_date <= ?');
      params.push(endDate);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY week_number DESC';

    console.log('Query:', query, 'Params:', params);

    const stmt = db.prepare(query);
    const weeks = params.length > 0 ? stmt.all(...params) : stmt.all();

    return NextResponse.json(weeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weeks', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { week_number, start_date, end_date, status = 'Missing' } = body;

    if (!week_number || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO weeks (week_number, start_date, end_date, status, total_hours, user_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(week_number, start_date, end_date, status, 0, 1);

    return NextResponse.json(
      {
        id: result.lastInsertRowid,
        week_number,
        start_date,
        end_date,
        status,
        total_hours: 0,
        user_id: 1,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating week:', error);
    return NextResponse.json(
      { error: 'Failed to create week' },
      { status: 500 }
    );
  }
}
