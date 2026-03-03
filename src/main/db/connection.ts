import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

let db: Database.Database | null = null;

export const initDb = () => {
    // Store the database in the userData directory so it persists across app updates
    const dbDir = path.join(app.getPath('userData'), 'database');

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'medeo-scheduler.sqlite');
    console.log('Initializing SQLite Database at:', dbPath);

    // Initialize the native C++ module connection
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency
    db.pragma('foreign_keys = ON'); // Enable foreign key constraint enforcement

    return db;
};

export const getDb = () => {
    if (!db) {
        throw new Error('Database has not been initialized. Call initDb() first.');
    }
    return db;
};
