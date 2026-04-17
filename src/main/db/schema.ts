import { getDb } from './connection';
import type { Database } from 'better-sqlite3';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Migration registry
//
// Each migration is a plain function that receives the db instance and runs
// inside a transaction already started by `runMigrations`. Migrations are
// numbered sequentially starting at 1. Only migrations with a version number
// greater than the stored `schema_version` will execute.
//
// To add a new migration: append a new entry to the MIGRATIONS array and
// increment the version. Never edit or delete existing entries.
// ---------------------------------------------------------------------------

type Migration = {
  version: number;
  description: string;
  up: (db: Database) => void;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Create base schema tables',
    up: (db) => {
      db.exec(`
                CREATE TABLE IF NOT EXISTS settings (
                    key   TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS fencers (
                    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name               TEXT    NOT NULL,
                    last_name                TEXT    NOT NULL,
                    sex                      TEXT,
                    year_of_birth            INTEGER NOT NULL,
                    usaf_id                  INTEGER NOT NULL DEFAULT 0,
                    last_membership_renewal  TEXT,
                    is_foil                  INTEGER NOT NULL DEFAULT 0,
                    is_epee                  INTEGER NOT NULL DEFAULT 0,
                    is_saber                 INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS class_types (
                    id                INTEGER PRIMARY KEY AUTOINCREMENT,
                    name              TEXT    NOT NULL UNIQUE,
                    member_price      REAL    NOT NULL,
                    non_member_price  REAL    NOT NULL
                );

                CREATE TABLE IF NOT EXISTS class_templates (
                    id               INTEGER PRIMARY KEY AUTOINCREMENT,
                    class_type_id    INTEGER,
                    name             TEXT    NOT NULL,
                    description      TEXT,
                    day_of_week      INTEGER,
                    start_time       TEXT,
                    duration_minutes INTEGER,
                    FOREIGN KEY(class_type_id) REFERENCES class_types(id)
                );

                CREATE TABLE IF NOT EXISTS class_sessions (
                    id               INTEGER PRIMARY KEY AUTOINCREMENT,
                    template_id      INTEGER,
                    class_type_id    INTEGER,
                    name             TEXT,
                    date             TEXT    NOT NULL,
                    start_time       TEXT    NOT NULL,
                    duration_minutes INTEGER NOT NULL,
                    FOREIGN KEY(template_id)   REFERENCES class_templates(id),
                    FOREIGN KEY(class_type_id) REFERENCES class_types(id)
                );

                CREATE TABLE IF NOT EXISTS class_coaches (
                    class_session_id INTEGER,
                    coach_id         INTEGER,
                    PRIMARY KEY (class_session_id, coach_id),
                    FOREIGN KEY(class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
                    FOREIGN KEY(coach_id)         REFERENCES fencers(id)
                );

                CREATE TABLE IF NOT EXISTS class_attendees (
                    class_session_id INTEGER,
                    fencer_id        INTEGER,
                    PRIMARY KEY (class_session_id, fencer_id),
                    FOREIGN KEY(class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
                    FOREIGN KEY(fencer_id)        REFERENCES fencers(id)
                );
            `);
    },
  },
  {
    version: 2,
    description: 'Add class_type_id and name columns to class_sessions',
    up: (db) => {
      const cols = (db.pragma('table_info(class_sessions)') as { name: string }[]).map(c => c.name);
      if (!cols.includes('class_type_id')) {
        db.exec('ALTER TABLE class_sessions ADD COLUMN class_type_id INTEGER REFERENCES class_types(id)');
      }
      if (!cols.includes('name')) {
        db.exec('ALTER TABLE class_sessions ADD COLUMN name TEXT');
      }
    },
  },
  {
    version: 3,
    description: 'Add usaf_id column to fencers',
    up: (db) => {
      const cols = (db.pragma('table_info(fencers)') as { name: string }[]).map(c => c.name);
      if (!cols.includes('usaf_id')) {
        db.exec('ALTER TABLE fencers ADD COLUMN usaf_id INTEGER NOT NULL DEFAULT 0');
      }
    },
  },
  {
    version: 4,
    description: 'Seed default admin PIN (sha256 of 1234)',
    up: (db) => {
      const existing = db
        .prepare("SELECT value FROM settings WHERE key = 'admin_pin_hash'")
        .get() as { value: string } | undefined;
      if (!existing) {
        const defaultHash = crypto.createHash('sha256').update('1234').digest('hex');
        db.prepare("INSERT INTO settings (key, value) VALUES ('admin_pin_hash', ?)").run(defaultHash);
      }
    },
  },
  {
    version: 5,
    description: 'Create special_events table',
    up: (db) => {
      db.exec(`
          CREATE TABLE IF NOT EXISTS special_events (
              id                 INTEGER PRIMARY KEY AUTOINCREMENT,
              name               TEXT    NOT NULL,
              type               TEXT    NOT NULL,
              date               TEXT    NOT NULL,
              cancels_classes    INTEGER NOT NULL DEFAULT 0,
              is_annual          INTEGER NOT NULL DEFAULT 0,
              excluded_class_ids TEXT
          );
      `);
    },
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export const runMigrations = () => {
  const db = getDb();

  console.log('Running database migrations...');

  // Ensure the version-tracking table exists before anything else (outside
  // the migration loop so we can read the current version safely).
  db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER NOT NULL
        );
        INSERT INTO schema_version (version)
        SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM schema_version);
    `);

  const row = db.prepare('SELECT version FROM schema_version').get() as { version: number };
  const currentVersion = row.version;

  const pending = MIGRATIONS.filter(m => m.version > currentVersion);

  if (pending.length === 0) {
    console.log('Database migrations completed. (already up to date)');
    return;
  }

  // Run each pending migration inside a single transaction for atomicity.
  const runAll = db.transaction(() => {
    for (const migration of pending) {
      console.log(`  → v${migration.version}: ${migration.description}`);
      migration.up(db);
      db.prepare('UPDATE schema_version SET version = ?').run(migration.version);
    }
  });

  runAll();

  console.log(`Database migrations completed. Schema is now at version ${pending[pending.length - 1].version}.`);
};
