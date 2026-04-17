import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../schema';

// Provide a stateful mock for better-sqlite3 so tests run without native bindings
vi.mock('better-sqlite3', () => {
    let fencersTable: any[] = [];
    class MockDatabase {
        exec = vi.fn();
        pragma = vi.fn(() => []);
        transaction = vi.fn((fn: any) => {
            return () => fn(); // Return a wrapped fn that executes the inner transaction
        });
        close = vi.fn(() => { fencersTable = []; });
        prepare = vi.fn((query: string) => {
            return {
                run: vi.fn((params) => {
                    if (query.includes('INSERT INTO fencers')) {
                        fencersTable.push(params);
                    }
                }),
                get: vi.fn(() => {
                    if (query.includes('schema_version')) {
                        return { version: 0 };
                    }
                    if (query.includes('settings')) {
                        return undefined; // no settings initially
                    }
                    return undefined;
                }),
                all: vi.fn(() => {
                    if (query.includes('SELECT * FROM fencers')) {
                        return fencersTable;
                    }
                    return [];
                })
            };
        });
    }

    return {
        default: MockDatabase
    };
});

// Store the actual DB instance for tests
let testDb: Database.Database;

// Mock the getDb method to return our in-memory db
vi.mock('../connection', () => {
    return {
        getDb: () => testDb,
        initDb: () => testDb,
    };
});

describe('Database Queries', () => {
    beforeEach(() => {
        // Create a new in-memory database before each test
        testDb = new Database(':memory:');

        // Run migrations to create schema
        // The migrations use getDb(), which we mocked above
        runMigrations();
    });

    afterEach(() => {
        // Close the database to free memory
        testDb.close();
    });

    it('should create and retrieve a fencer', () => {
        const createStmt = testDb.prepare(`
            INSERT INTO fencers (first_name, last_name, sex, year_of_birth, usaf_id, last_membership_renewal, is_foil, is_epee, is_saber)
            VALUES (@first_name, @last_name, @sex, @year_of_birth, @usaf_id, @last_membership_renewal, @is_foil, @is_epee, @is_saber)
        `);

        createStmt.run({
            first_name: 'Test',
            last_name: 'Fencer',
            sex: 'M',
            year_of_birth: 2000,
            usaf_id: 12345,
            last_membership_renewal: '2025-01-01',
            is_foil: 1,
            is_epee: 0,
            is_saber: 0
        });

        const getStmt = testDb.prepare('SELECT * FROM fencers');
        const fencers = getStmt.all();

        expect(fencers.length).toBe(1);
        expect((fencers[0] as any).first_name).toBe('Test');
    });
});
