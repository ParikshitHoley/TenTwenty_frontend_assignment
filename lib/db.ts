import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

function initializeDatabase(database: Database.Database) {
  // Create tables if they don't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS weeks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_number INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Missing',
      total_hours INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timesheet_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      project_name TEXT NOT NULL,
      type_of_work TEXT NOT NULL,
      description TEXT,
      hours INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if demo user exists
  const userExists = database.prepare('SELECT * FROM users WHERE email = ?').get('admin@gmail.com');
  
  if (!userExists) {
    database.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(
      'admin@gmail.com',
      'admin',
      'Admin User'
    );
  }

  // Check if weeks exist, if not, seed them
  const weeksCount = database.prepare('SELECT COUNT(*) as count FROM weeks').get() as any;
  
  if (weeksCount.count === 0) {
    // Seed weeks data for demo
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    const currentMonday = new Date(currentDate);
    currentMonday.setDate(currentDate.getDate() - daysFromMonday);

    // Add last 5 weeks (going backwards from current week)
    for (let i = 4; i >= 0; i--) {
      const startDate = new Date(currentMonday);
      startDate.setDate(currentMonday.getDate() - i * 7);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4); // Monday to Friday

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Calculate week number
      const weekNumber = Math.ceil(
        (startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );

      database.prepare(
        'INSERT INTO weeks (week_number, start_date, end_date, status, total_hours, user_id) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(weekNumber, startStr, endStr, 'Missing', 0, 1);
    }
  }
}

export function getDb() {
  if (!db) {
    // Use /tmp on Vercel (serverless environment), fallback to local data directory
    const isVercel = process.env.VERCEL === '1';
    const dbPath = isVercel
      ? path.join('/tmp', 'timesheet.db')
      : path.join(process.cwd(), 'data', 'timesheet.db');
    
    // Create directory if needed (not needed for /tmp as it always exists)
    if (!isVercel) {
      const dataDir = path.dirname(dbPath);
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      } catch (err) {
        console.error('Error creating data directory:', err);
        throw new Error(`Failed to create data directory at ${dataDir}`);
      }
    }

    try {
      console.log(`Opening database at: ${dbPath}`);
      db = new Database(dbPath);
      db.pragma('foreign_keys = ON');
      db.pragma('journal_mode = WAL');
      
      // Initialize database on first connection
      initializeDatabase(db);
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Error initializing database:', err);
      db = null;
      throw err;
    }
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
