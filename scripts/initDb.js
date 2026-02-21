import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "timesheet.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
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
const userExists = db
  .prepare("SELECT * FROM users WHERE email = ?")
  .get("admin@gmail.com");

if (!userExists) {
  // For demo, store password as plain text (not secure for production)
  db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(
    "admin@gmail.com",
    "admin",
    "Admin User",
  );
  console.log("✓ Demo user created: admin@gmail.com / admin");
}

// Seed weeks data for demo
// Clear existing weeks and timesheet entries
db.prepare("DELETE FROM timesheet_entries").run();
db.prepare("DELETE FROM weeks").run();

const currentDate = new Date();
// Get Monday of current week
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

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Calculate week number
  const weekNumber = Math.ceil(
    (startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );

  db.prepare(
    "INSERT INTO weeks (week_number, start_date, end_date, status, total_hours, user_id) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(weekNumber, startStr, endStr, "Missing", 0, 1);
}
console.log("✓ Last 5 weeks seeded");

console.log("✓ Database initialized at:", dbPath);
db.close();
