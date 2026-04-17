import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerIpcHandlers } from '../handlers';
import { ipcMain } from 'electron';
import * as dbConnection from '../../db/connection';
import Database from 'better-sqlite3';

vi.mock('electron', () => ({
    ipcMain: { handle: vi.fn() },
    dialog: { showSaveDialog: vi.fn() },
    BrowserWindow: { fromWebContents: vi.fn() }
}));

vi.mock('better-sqlite3', () => {
    class MockDatabase {
        exec = vi.fn();
        pragma = vi.fn(() => []);
        transaction = vi.fn((fn: any) => () => fn());
        prepare = vi.fn(() => ({ run: vi.fn(), get: vi.fn(), all: vi.fn() }));
    }
    return { default: MockDatabase };
});

vi.mock('../../db/connection', () => ({
    getDb: vi.fn()
}));

vi.mock('../../db/queries', () => ({
    getFencers: vi.fn(() => []),
    getFencersCount: vi.fn(() => 0),
    createFencer: vi.fn(() => ({ lastInsertRowid: 1, changes: 1 })),
}));

describe('IPC Handlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(dbConnection, 'getDb').mockReturnValue(new Database(':memory:') as any);
    });

    it('should register all IPC handlers under the correct channels', () => {
        registerIpcHandlers();
        const calls = (ipcMain.handle as any).mock.calls;
        const registeredChannels = calls.map((args: any[]) => args[0]);

        expect(registeredChannels).toContain('getFencers');
        expect(registeredChannels).toContain('createFencer');
        expect(registeredChannels).toContain('verifyAdminPin');
    });

    it('should execute getFencers handler successfully', async () => {
        registerIpcHandlers();
        
        // Find the 'getFencers' handler registration
        const getFencersCall = (ipcMain.handle as any).mock.calls.find((args: any[]) => args[0] === 'getFencers');
        expect(getFencersCall).toBeDefined();

        const handler = getFencersCall[1];
        // Invoke the handler function directly
        const result = await handler({} as any);

        expect(result).toStrictEqual({
            success: true,
            data: { items: [], total: 0 }
        });
    });
});
