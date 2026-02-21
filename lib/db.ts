import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'timesheet.db');
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
