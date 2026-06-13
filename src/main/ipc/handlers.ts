import { ipcMain, dialog, BrowserWindow } from 'electron';
import { getDb } from '../db/connection';
import fs from 'fs';
import crypto from 'crypto';
import { stringify } from 'csv-stringify/sync';
import * as q from '../db/queries';

export function registerIpcHandlers() {
    const db = getDb();

    // --- FENCERS ---

    ipcMain.handle('getFencers', (_, page?: number, pageSize?: number) => {
        try {
            if (page !== undefined && pageSize !== undefined) {
                const offset = (page - 1) * pageSize;
                const data = q.getFencers(db, pageSize, offset);
                const total = q.getFencersCount(db);
                return { success: true, data: { items: data, total } };
            }
            return { success: true, data: { items: q.getFencers(db), total: q.getFencersCount(db) } };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createFencer', (_, fencer) => {
        try {
            const info = q.createFencer(db, fencer);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateFencer', (_, fencer) => {
        try {
            const info = q.updateFencer(db, fencer);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Note: deleteFencer removed per System_Spec.md §3 — inactive fencers should remain
    // in the database to preserve historical attendance records.

    // --- CLASS TYPES ---

    ipcMain.handle('getClassTypes', () => {
        try {
            return { success: true, data: q.getClassTypes(db) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createClassType', (_, classType) => {
        try {
            const info = q.createClassType(db, classType);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateClassType', (_, classType) => {
        try {
            const info = q.updateClassType(db, classType);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteClassType', (_, id: number) => {
        try {
            const info = q.deleteClassType(db, id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- CLASS TEMPLATES ---

    ipcMain.handle('getClassTemplates', (_, page?: number, pageSize?: number) => {
        try {
            if (page !== undefined && pageSize !== undefined) {
                const offset = (page - 1) * pageSize;
                const data = q.getClassTemplates(db, pageSize, offset);
                const total = q.getClassTemplatesCount(db);
                return { success: true, data: { items: data, total } };
            }
            return { success: true, data: { items: q.getClassTemplates(db), total: q.getClassTemplatesCount(db) } };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createClassTemplate', (_, template) => {
        try {
            const info = q.createClassTemplate(db, template);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateClassTemplate', (_, template) => {
        try {
            const info = q.updateClassTemplate(db, template);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteClassTemplate', (_, id: number) => {
        try {
            const info = q.deleteClassTemplate(db, id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- CLASS SESSIONS ---

    ipcMain.handle('getOrCreateClassSessionsByDate', (_, date: string) => {
        try {
            // Parse date manually to avoid timezone shifting
            const [year, month, day] = date.split('-').map(Number);
            const dayOfWeek = new Date(year, month - 1, day).getDay();

            // 1. Check for any Special Events today that cancel classes
            const specialEvents = q.getSpecialEventsByDate(db, date) as any[];
            const cancelsEvent = specialEvents.find(e => e.cancels_classes === 1);

            if (!cancelsEvent) {
                // Normal day: Auto-instantiate any templates for this day of week that don't have a session yet
                q.insertTemplatedSessions(db, date, dayOfWeek);
                return { success: true, data: q.getSessionsByDate(db, date) };
            } else {
                // Classes are cancelled! 
                // Only return sessions that are explicitly "Kept/Excluded" from cancellation.
                let excludedIds: number[] = [];
                if (cancelsEvent.excluded_class_ids) {
                    try {
                        excludedIds = JSON.parse(cancelsEvent.excluded_class_ids);
                    } catch (e) {
                        console.error("Failed to parse excluded_class_ids:", e);
                    }
                }

                // Still fetch the actual scheduled sessions for today in case they were already generated or ad-hoc
                const allSessions = q.getSessionsByDate(db, date) as any[];

                // Filter to only kept ones
                const keptSessions = allSessions.filter(s => excludedIds.includes(s.id));
                return { success: true, data: keptSessions };
            }
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createClassSession', (_, session) => {
        try {
            const info = q.createClassSession(db, session);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteClassSession', (_, id: number) => {
        try {
            const info = q.deleteClassSession(db, id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateClassSession', (_, session) => {
        try {
            const info = q.updateClassSession(db, session);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- ATTENDANCE ---

    ipcMain.handle('getAttendeesForSession', (_, sessionId: number) => {
        try {
            return { success: true, data: q.getAttendeesForSession(db, sessionId) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('addAttendee', (_, sessionId: number, fencerId: number, fraction?: number) => {
        try {
            const info = q.addAttendee(db, sessionId, fencerId, fraction ?? 1.0);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('removeAttendee', (_, sessionId: number, fencerId: number) => {
        try {
            const info = q.removeAttendee(db, sessionId, fencerId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- COACHES ---

    ipcMain.handle('getCoachesForSession', (_, sessionId: number) => {
        try {
            return { success: true, data: q.getCoachesForSession(db, sessionId) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('addCoach', (_, sessionId: number, coachId: number) => {
        try {
            const info = q.addCoach(db, sessionId, coachId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('removeCoach', (_, sessionId: number, coachId: number) => {
        try {
            const info = q.removeCoach(db, sessionId, coachId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- REPORTS ---

    ipcMain.handle('generateExportCsv', async (event, startDate: string, endDate: string) => {
        try {
            const classTypesData = q.getClassTypesForReport(db);
            const fencersData = q.getFencersForReport(db);
            const attendanceData = q.getAttendanceByPeriod(db, startDate, endDate) as {
                fencer_id: number; class_type_id: number; attendance_count: number;
            }[];

            const attendeeCounts = new Map<number, Map<number, number>>();
            for (const row of attendanceData) {
                if (!attendeeCounts.has(row.fencer_id)) {
                    attendeeCounts.set(row.fencer_id, new Map<number, number>());
                }
                const fMap = attendeeCounts.get(row.fencer_id);
                if (fMap) fMap.set(row.class_type_id, row.attendance_count);
            }

            const headers = ['First Name', 'Last Name', 'USAF ID'];
            for (const ct of classTypesData) headers.push(ct.name);
            headers.push('Member Status');

            const rows: (string | number)[][] = [];
            const exportDateObj = new Date(endDate);

            for (const fencer of fencersData) {
                if (!attendeeCounts.has(fencer.id)) continue;
                const counts = attendeeCounts.get(fencer.id);
                if (!counts) continue;

                let isMember = 'No';
                if (fencer.last_membership_renewal) {
                    const renewalDate = new Date(fencer.last_membership_renewal);
                    const expiryDate = new Date(renewalDate);
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    if (exportDateObj <= expiryDate) isMember = 'Yes';
                }

                const row: (string | number)[] = [fencer.first_name, fencer.last_name, fencer.usaf_id || 0];
                for (const ct of classTypesData) {
                    const rawVal = counts.get(ct.id) || 0;
                    const roundedVal = Math.round(rawVal * 100) / 100;
                    row.push(roundedVal);
                }
                row.push(isMember);
                rows.push(row);
            }

            if (rows.length === 0) {
                return { success: false, error: 'No attendance data found for the selected period.' };
            }

            const csvString = stringify([headers, ...rows]);

            const win = BrowserWindow.fromWebContents(event.sender);
            if (!win) return { success: false, error: 'No active window found for export dialog.' };

            const { canceled, filePath } = await dialog.showSaveDialog(win, {
                title: 'Save Attendance Report',
                defaultPath: `Medeo_Attendance_${startDate}_to_${endDate}.csv`,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }]
            });

            if (canceled || !filePath) return { success: false, error: 'Export canceled by user.' };

            fs.writeFileSync(filePath, csvString, 'utf-8');
            return { success: true };

        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- ADMIN PIN ---

    const ADMIN_PIN_SALT = 'MedeoScheduler_Secure_Salt_2026';

    ipcMain.handle('verifyAdminPin', (_, pin: string) => {
        try {
            const inputScrypt = crypto.scryptSync(pin, ADMIN_PIN_SALT, 64).toString('hex');
            const row = q.getSettingByKey(db, 'admin_pin_hash');

            // 1. Check if it matches the new strong hash
            if (row?.value === inputScrypt) {
                return { success: true };
            }

            // 2. Fallback check for old SHA-256 hash (migration)
            const inputSha256 = crypto.createHash('sha256').update(pin).digest('hex');
            if (row?.value === inputSha256) {
                // Pin is correct! Upgrade the hash in the DB seamlessly
                q.updateSettingByKey(db, inputScrypt, 'admin_pin_hash');
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

            const row = q.getSettingByKey(db, 'admin_pin_hash');

            // Allow initial setup if no PIN currently exists
            if (row?.value && row.value !== currentScrypt && row.value !== currentSha256) {
                return { success: false, error: 'Current PIN is incorrect.' };
            }

            const newScrypt = crypto.scryptSync(newPin, ADMIN_PIN_SALT, 64).toString('hex');
            q.updateSettingByKey(db, newScrypt, 'admin_pin_hash');
            return { success: true };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- SPECIAL EVENTS ---

    ipcMain.handle('getSpecialEventsByDate', (_, date: string) => {
        try {
            return { success: true, data: q.getSpecialEventsByDate(db, date) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createSpecialEvent', (_, event) => {
        try {
            const info = q.createSpecialEvent(db, event);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateSpecialEvent', (_, event) => {
        try {
            const info = q.updateSpecialEvent(db, event);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteSpecialEvent', (_, id: number) => {
        try {
            const info = q.deleteSpecialEvent(db, id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });
}
