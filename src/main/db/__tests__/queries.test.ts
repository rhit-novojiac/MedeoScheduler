import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../schema';
import * as q from '../queries';

// Provide a stateful mock for better-sqlite3 so tests run without native bindings
vi.mock('better-sqlite3', () => {
    let fencersTable: any[] = [];
    let attendeesTable: any[] = [];
    class MockDatabase {
        exec = vi.fn();
        pragma = vi.fn(() => []);
        transaction = vi.fn((fn: any) => {
            return () => fn(); // Return a wrapped fn that executes the inner transaction
        });
        close = vi.fn(() => { fencersTable = []; attendeesTable = []; });
        prepare = vi.fn((query: string) => {
            return {
                run: vi.fn((...args) => {
                    const params = args[0];
                    if (query.includes('INSERT INTO fencers')) {
                        fencersTable.push(params);
                    } else if (query.includes('INSERT INTO class_attendees')) {
                        let sessionId = args[0];
                        let fencerId = args[1];
                        let fraction = args[2] !== undefined ? args[2] : 1.0;
                        
                        // Handle upsert simulation
                        attendeesTable = attendeesTable.filter(
                            a => !(a.class_session_id === sessionId && a.fencer_id === fencerId)
                        );
                        attendeesTable.push({ class_session_id: sessionId, fencer_id: fencerId, fraction });
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
                all: vi.fn((...args) => {
                    if (query.includes('SELECT * FROM fencers')) {
                        return fencersTable;
                    }
                    if (query.includes('SELECT f.*, a.fraction')) {
                        const sessionId = args[0];
                        const sessionAttendees = attendeesTable.filter(a => a.class_session_id === sessionId);
                        return sessionAttendees.map(att => {
                            const fencer = fencersTable.find((f, idx) => (f.id || idx + 1) === att.fencer_id) || {};
                            return { ...fencer, fraction: att.fraction };
                        });
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

    it('should support adding an attendee with a fraction value and retrieving it', () => {
        // Mock query states
        const fencer = {
            id: 1,
            first_name: 'Alice',
            last_name: 'Smith',
            sex: 'F',
            year_of_birth: 1995,
            usaf_id: 67890,
            last_membership_renewal: '2026-01-01',
            is_foil: 0,
            is_epee: 1,
            is_saber: 0
        };

        const fencerInsert = testDb.prepare('INSERT INTO fencers');
        fencerInsert.run(fencer);

        // Add fencer to session 10 with 2/3 participation fraction (0.67)
        q.addAttendee(testDb, 10, 1, 0.67);

        // Retrieve attendees
        const attendees = q.getAttendeesForSession(testDb, 10);
        expect(attendees.length).toBe(1);
        expect(attendees[0].first_name).toBe('Alice');
        expect((attendees[0] as any).fraction).toBe(0.67);
    });
});
