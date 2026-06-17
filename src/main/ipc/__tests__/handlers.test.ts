import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerIpcHandlers } from '../handlers';
import { ipcMain, dialog } from 'electron';

// Setup stateful FS mock variable
let mockFiles: { [path: string]: string } = {};

vi.mock('electron', () => ({
    ipcMain: { handle: vi.fn() },
    dialog: { showSaveDialog: vi.fn() },
    BrowserWindow: { fromWebContents: vi.fn(() => ({})) },
    app: { getPath: vi.fn(() => 'c:/mock/user/data') }
}));

vi.mock('fs', () => {
    return {
        default: {
            existsSync: vi.fn((p: string) => {
                const normalized = p.replace(/\\/g, '/');
                return normalized in mockFiles;
            }),
            readFileSync: vi.fn((p: string) => {
                const normalized = p.replace(/\\/g, '/');
                return mockFiles[normalized] || '';
            }),
            writeFileSync: vi.fn((p: string, content: string) => {
                const normalized = p.replace(/\\/g, '/');
                mockFiles[normalized] = content;
            }),
            mkdirSync: vi.fn()
        }
    };
});

describe('IPC Handlers (Supabase / Direct Query Architecture)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFiles = {};
    });

    it('should register verifyAdminPin, updateAdminPin, and saveCsv handlers', () => {
        registerIpcHandlers();
        const calls = (ipcMain.handle as any).mock.calls;
        const registeredChannels = calls.map((args: any[]) => args[0]);

        expect(registeredChannels).toContain('verifyAdminPin');
        expect(registeredChannels).toContain('updateAdminPin');
        expect(registeredChannels).toContain('saveCsv');
    });

    it('should verify admin PIN successfully using the default PIN hash (1234)', async () => {
        registerIpcHandlers();
        
        const verifyCall = (ipcMain.handle as any).mock.calls.find((args: any[]) => args[0] === 'verifyAdminPin');
        expect(verifyCall).toBeDefined();

        const handler = verifyCall[1];
        
        // Default PIN is '1234'
        const result = await handler({} as any, '1234');
        expect(result).toStrictEqual({ success: true });
    });

    it('should reject incorrect PINs', async () => {
        registerIpcHandlers();
        
        const verifyCall = (ipcMain.handle as any).mock.calls.find((args: any[]) => args[0] === 'verifyAdminPin');
        const handler = verifyCall[1];

        const result = await handler({} as any, '9999');
        expect(result).toStrictEqual({ success: false });
    });

    it('should allow updating the admin PIN hash', async () => {
        registerIpcHandlers();
        
        const updateCall = (ipcMain.handle as any).mock.calls.find((args: any[]) => args[0] === 'updateAdminPin');
        const verifyCall = (ipcMain.handle as any).mock.calls.find((args: any[]) => args[0] === 'verifyAdminPin');
        
        const updateHandler = updateCall[1];
        const verifyHandler = verifyCall[1];

        // Update from default '1234' to '5678'
        const updateResult = await updateHandler({} as any, '1234', '5678');
        expect(updateResult).toStrictEqual({ success: true });

        // Verify with new PIN '5678'
        const verifyNewResult = await verifyHandler({} as any, '5678');
        expect(verifyNewResult).toStrictEqual({ success: true });

        // Verify with old PIN '1234' fails
        const verifyOldResult = await verifyHandler({} as any, '1234');
        expect(verifyOldResult).toStrictEqual({ success: false });
    });

    it('should invoke save dialog and write CSV string to disk', async () => {
        registerIpcHandlers();
        
        const saveCsvCall = (ipcMain.handle as any).mock.calls.find((args: any[]) => args[0] === 'saveCsv');
        expect(saveCsvCall).toBeDefined();

        const handler = saveCsvCall[1];

        vi.spyOn(dialog, 'showSaveDialog').mockResolvedValue({
            canceled: false,
            filePath: 'c:/mock/save/path.csv'
        } as any);

        const result = await handler({} as any, 'col1,col2\nval1,val2', 'default.csv');
        expect(result).toStrictEqual({ success: true });

        const writtenContent = mockFiles['c:/mock/save/path.csv'];
        expect(writtenContent).toBe('col1,col2\nval1,val2');
    });
});
