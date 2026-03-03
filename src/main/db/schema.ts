import { getDb } from './connection';
import crypto from 'crypto';

export const runMigrations = () => {
    const db = getDb();

    console.log('Running database migrations...');

    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fencers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      sex TEXT,
      year_of_birth INTEGER NOT NULL,
      usaf_id INTEGER NOT NULL DEFAULT 0,
      last_membership_renewal TEXT,
      is_foil INTEGER NOT NULL DEFAULT 0,
      is_epee INTEGER NOT NULL DEFAULT 0,
      is_saber INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS class_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      member_price REAL NOT NULL,
      non_member_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS class_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_type_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      day_of_week INTEGER,
      start_time TEXT,
      duration_minutes INTEGER,
      FOREIGN KEY(class_type_id) REFERENCES class_types(id)
    );

    CREATE TABLE IF NOT EXISTS class_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER,
      class_type_id INTEGER,
      name TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      FOREIGN KEY(template_id) REFERENCES class_templates(id),
      FOREIGN KEY(class_type_id) REFERENCES class_types(id)
    );

    CREATE TABLE IF NOT EXISTS class_coaches (
      class_session_id INTEGER,
      coach_id INTEGER,
      PRIMARY KEY (class_session_id, coach_id),
      FOREIGN KEY(class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(coach_id) REFERENCES fencers(id)
    );

    CREATE TABLE IF NOT EXISTS class_attendees (
      class_session_id INTEGER,
      fencer_id INTEGER,
      PRIMARY KEY (class_session_id, fencer_id),
      FOREIGN KEY(class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(fencer_id) REFERENCES fencers(id)
    );
  `);

    // --- Incremental Migrations for existing databases ---
    // Add class_type_id + name columns to class_sessions if they don't exist yet
    const sessionCols = db.pragma('table_info(class_sessions)') as { name: string }[];
    const colNames = sessionCols.map(c => c.name);

    if (!colNames.includes('class_type_id')) {
        db.exec('ALTER TABLE class_sessions ADD COLUMN class_type_id INTEGER REFERENCES class_types(id)');
        console.log('Migration: Added class_type_id column to class_sessions');
    }
    if (!colNames.includes('name')) {
        db.exec('ALTER TABLE class_sessions ADD COLUMN name TEXT');
        console.log('Migration: Added name column to class_sessions');
    }

    // Add usaf_id column to fencers if it doesn't exist yet
    const fencerCols = db.pragma('table_info(fencers)') as { name: string }[];
    const fencerColNames = fencerCols.map(c => c.name);
    if (!fencerColNames.includes('usaf_id')) {
        db.exec('ALTER TABLE fencers ADD COLUMN usaf_id INTEGER NOT NULL DEFAULT 0');
        console.log('Migration: Added usaf_id column to fencers');
    }

    // Seed the default admin PIN if not yet set
    const existingPin = db.prepare("SELECT value FROM settings WHERE key = 'admin_pin_hash'").get() as { value: string } | undefined;
    if (!existingPin) {
        const defaultHash = crypto.createHash('sha256').update('1234').digest('hex');
        db.prepare("INSERT INTO settings (key, value) VALUES ('admin_pin_hash', ?)").run(defaultHash);
        console.log('Migration: Seeded default admin PIN.');
    }

    console.log('Database migrations completed.');
};
