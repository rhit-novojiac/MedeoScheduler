import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMigrations } from '../schema';
import * as dbConnection from '../connection';
import Database from 'better-sqlite3';

vi.mock('better-sqlite3', () => {
    const memory: any[] = [];
    class MockDatabase {
        exec = vi.fn();
        pragma = vi.fn(() => [{ name: 'dummy_column' }]);
        transaction = vi.fn((fn: any) => () => fn());
        prepare = vi.fn(() => ({
            get: vi.fn(() => ({ version: 0, value: 'hash' })),
            run: vi.fn((...args) => { memory.push(args); }),
            all: vi.fn(() => [])
        }));
    }
    return { default: MockDatabase };
});

describe('Database Schema Migrations', () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = new Database(':memory:');
        vi.spyOn(dbConnection, 'getDb').mockReturnValue(mockDb);
    });

    it('should successfully run all schema migrations without throwing', () => {
        expect(() => runMigrations()).not.toThrow();
        expect(mockDb.exec).toHaveBeenCalled();
        expect(mockDb.prepare).toHaveBeenCalledWith('SELECT version FROM schema_version');
    });
});
