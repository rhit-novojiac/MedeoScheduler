import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ADMIN_PIN_SALT = 'MedeoScheduler_Secure_Salt_2026';

function getSettingsPath() {
    return path.join(app.getPath('userData'), 'admin_settings.json');
}

function getAdminPinHash(): string {
    const filePath = getSettingsPath();
    const defaultSha256 = crypto.createHash('sha256').update('1234').digest('hex'); // '1234' default
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (data && data.admin_pin_hash) {
                return data.admin_pin_hash;
            }
        }
    } catch (e) {
        console.error('Failed to read admin PIN hash:', e);
    }
    // Write default if not present
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify({ admin_pin_hash: defaultSha256 }), 'utf-8');
    } catch (e) {
        console.error('Failed to write default admin PIN hash:', e);
    }
    return defaultSha256;
}

function updateAdminPinHash(newHash: string) {
    const filePath = getSettingsPath();
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify({ admin_pin_hash: newHash }), 'utf-8');
        return true;
    } catch (e) {
        console.error('Failed to update admin PIN hash:', e);
        throw e;
    }
}

export function registerIpcHandlers() {
    // --- ADMIN PIN ---

    ipcMain.handle('verifyAdminPin', (_, pin: string) => {
        try {
            const inputScrypt = crypto.scryptSync(pin, ADMIN_PIN_SALT, 64).toString('hex');
            const storedHash = getAdminPinHash();

            // 1. Check if it matches the new strong hash
            if (storedHash === inputScrypt) {
                return { success: true };
            }

            // 2. Fallback check for old SHA-256 hash
            const inputSha256 = crypto.createHash('sha256').update(pin).digest('hex');
            if (storedHash === inputSha256) {
                // Pin is correct! Upgrade the hash in the local file seamlessly
                updateAdminPinHash(inputScrypt);
                return { success: true };
            }

            return { success: false };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateAdminPin', (_, currentPin: string, newPin: string) => {
        try {
            const currentScrypt = crypto.scryptSync(currentPin, ADMIN_PIN_SALT, 64).toString('hex');
            const currentSha256 = crypto.createHash('sha256').update(currentPin).digest('hex');

            const storedHash = getAdminPinHash();

            // Allow initial setup if no PIN currently exists or it matches
            if (storedHash && storedHash !== currentScrypt && storedHash !== currentSha256) {
                return { success: false, error: 'Current PIN is incorrect.' };
            }

            const newScrypt = crypto.scryptSync(newPin, ADMIN_PIN_SALT, 64).toString('hex');
            updateAdminPinHash(newScrypt);
            return { success: true };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- CSV SAVE DIALOG ---
    ipcMain.handle('saveCsv', async (event, content: string, defaultFilename: string) => {
        try {
            const win = BrowserWindow.fromWebContents(event.sender);
            if (!win) return { success: false, error: 'No active window found for export dialog.' };

            const { canceled, filePath } = await dialog.showSaveDialog(win, {
                title: 'Save Attendance Report',
                defaultPath: defaultFilename,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }]
            });

            if (canceled || !filePath) return { success: false, error: 'Export canceled by user.' };

            fs.writeFileSync(filePath, content, 'utf-8');
            return { success: true };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });
}
