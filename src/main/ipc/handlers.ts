import { ipcMain, dialog, BrowserWindow } from 'electron';
import { getDb } from '../db/connection';
import fs from 'fs';
import crypto from 'crypto';
import { stringify } from 'csv-stringify/sync';

export function registerIpcHandlers() {
    const db = getDb();

    // --- FENCERS ---

    ipcMain.handle('getFencers', () => {
        try {
            const stmt = db.prepare('SELECT * FROM fencers ORDER BY last_name ASC, first_name ASC');
            return { success: true, data: stmt.all() };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createFencer', (_, fencer) => {
        try {
            const stmt = db.prepare(`
        INSERT INTO fencers (first_name, last_name, sex, year_of_birth, usaf_id, last_membership_renewal, is_foil, is_epee, is_saber)
        VALUES (@first_name, @last_name, @sex, @year_of_birth, @usaf_id, @last_membership_renewal, @is_foil, @is_epee, @is_saber)
        `);
            const info = stmt.run(fencer);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateFencer', (_, fencer) => {
        try {
            const stmt = db.prepare(`
        UPDATE fencers 
        SET first_name = @first_name, last_name = @last_name, sex = @sex, year_of_birth = @year_of_birth, 
            usaf_id = @usaf_id, last_membership_renewal = @last_membership_renewal, is_foil = @is_foil, is_epee = @is_saber, is_saber = @is_saber
        WHERE id = @id
        `);
            const info = stmt.run(fencer);
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
            const stmt = db.prepare('SELECT * FROM class_types ORDER BY name ASC');
            return { success: true, data: stmt.all() };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createClassType', (_, classType) => {
        try {
            const stmt = db.prepare(`
        INSERT INTO class_types (name, member_price, non_member_price)
        VALUES (@name, @member_price, @non_member_price)
        `);
            const info = stmt.run(classType);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateClassType', (_, classType) => {
        try {
            const stmt = db.prepare(`
        UPDATE class_types
        SET name = @name, member_price = @member_price, non_member_price = @non_member_price
        WHERE id = @id
        `);
            const info = stmt.run(classType);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteClassType', (_, id: number) => {
        try {
            const stmt = db.prepare('DELETE FROM class_types WHERE id = ?');
            const info = stmt.run(id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- CLASS TEMPLATES ---

    ipcMain.handle('getClassTemplates', () => {
        try {
            const stmt = db.prepare(`
            SELECT 
                t.*,
                c.name as class_type_name
            FROM class_templates t
            LEFT JOIN class_types c ON t.class_type_id = c.id
            ORDER BY t.day_of_week ASC, t.start_time ASC
            `);
            return { success: true, data: stmt.all() };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createClassTemplate', (_, template) => {
        try {
            const stmt = db.prepare(`
            INSERT INTO class_templates (class_type_id, name, description, day_of_week, start_time, duration_minutes)
            VALUES (@class_type_id, @name, @description, @day_of_week, @start_time, @duration_minutes)
            `);
            const info = stmt.run(template);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateClassTemplate', (_, template) => {
        try {
            const stmt = db.prepare(`
            UPDATE class_templates
            SET class_type_id = @class_type_id, name = @name, description = @description, day_of_week = @day_of_week, start_time = @start_time, duration_minutes = @duration_minutes
            WHERE id = @id
            `);
            const info = stmt.run(template);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteClassTemplate', (_, id: number) => {
        try {
            const stmt = db.prepare('DELETE FROM class_templates WHERE id = ?');
            const info = stmt.run(id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- CLASS SESSIONS ---

    ipcMain.handle('getOrCreateClassSessionsByDate', (_, date: string) => {
        try {
            // date format expected: "YYYY-MM-DD"
            // Get day of week (0-6, Sunday-Saturday). Parse manually to avoid timezone shifting
            const [year, month, day] = date.split('-').map(Number);
            const dayOfWeek = new Date(year, month - 1, day).getDay();

            // Auto-instantiate any templates for this day of week that don't have a session yet on this date
            // Populate the new class_type_id and name columns from the template
            const insertStmt = db.prepare(`
                INSERT INTO class_sessions (template_id, class_type_id, name, date, start_time, duration_minutes)
                SELECT t.id, t.class_type_id, t.name, ?, t.start_time, t.duration_minutes
                FROM class_templates t
                WHERE t.day_of_week = ?
                  AND NOT EXISTS (
                      SELECT 1 FROM class_sessions s 
                      WHERE s.template_id = t.id AND s.date = ?
                  )
            `);
            insertStmt.run(date, dayOfWeek, date);

            // Fetch all sessions for this date (both auto-generated and ad-hoc)
            // Use COALESCE to prefer session-level name/type, falling back to the template
            const fetchStmt = db.prepare(`
                SELECT 
                    s.*,
                    COALESCE(s.name, t.name) as template_name,
                    t.description,
                    COALESCE(ct_direct.name, ct_template.name) as class_type_name,
                    (SELECT COUNT(*) FROM class_attendees ca WHERE ca.class_session_id = s.id) as attendee_count
                FROM class_sessions s
                LEFT JOIN class_templates t ON s.template_id = t.id
                LEFT JOIN class_types ct_direct ON s.class_type_id = ct_direct.id
                LEFT JOIN class_types ct_template ON t.class_type_id = ct_template.id
                WHERE s.date = ?
                ORDER BY s.start_time ASC
            `);
            return { success: true, data: fetchStmt.all(date) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('createClassSession', (_, session) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO class_sessions (template_id, class_type_id, name, date, start_time, duration_minutes)
                VALUES (@template_id, @class_type_id, @name, @date, @start_time, @duration_minutes)
            `);
            const info = stmt.run(session);
            return { success: true, data: info.lastInsertRowid };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('deleteClassSession', (_, id: number) => {
        try {
            const stmt = db.prepare('DELETE FROM class_sessions WHERE id = ?');
            const info = stmt.run(id);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- ATTENDANCE ---

    ipcMain.handle('getAttendeesForSession', (_, sessionId: number) => {
        try {
            const stmt = db.prepare(`
          SELECT f.* 
          FROM fencers f
          JOIN class_attendees a ON f.id = a.fencer_id
          WHERE a.class_session_id = ?
        `);
            return { success: true, data: stmt.all(sessionId) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('addAttendee', (_, sessionId: number, fencerId: number) => {
        try {
            const stmt = db.prepare(`
          INSERT OR IGNORE INTO class_attendees (class_session_id, fencer_id)
          VALUES (?, ?)
        `);
            const info = stmt.run(sessionId, fencerId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('removeAttendee', (_, sessionId: number, fencerId: number) => {
        try {
            const stmt = db.prepare(`
          DELETE FROM class_attendees
          WHERE class_session_id = ? AND fencer_id = ?
        `);
            const info = stmt.run(sessionId, fencerId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- COACHES ---

    ipcMain.handle('getCoachesForSession', (_, sessionId: number) => {
        try {
            const stmt = db.prepare(`
          SELECT f.*
          FROM fencers f
          JOIN class_coaches c ON f.id = c.coach_id
          WHERE c.class_session_id = ?
        `);
            return { success: true, data: stmt.all(sessionId) };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('addCoach', (_, sessionId: number, coachId: number) => {
        try {
            const stmt = db.prepare(`
          INSERT OR IGNORE INTO class_coaches (class_session_id, coach_id)
          VALUES (?, ?)
        `);
            const info = stmt.run(sessionId, coachId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('removeCoach', (_, sessionId: number, coachId: number) => {
        try {
            const stmt = db.prepare(`
          DELETE FROM class_coaches
          WHERE class_session_id = ? AND coach_id = ?
        `);
            const info = stmt.run(sessionId, coachId);
            return { success: true, data: info.changes > 0 };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- REPORTS ---

    ipcMain.handle('generateExportCsv', async (_, startDate: string, endDate: string) => {
        try {
            // 1. Fetch class types for dynamic columns
            const classTypesData = db.prepare('SELECT id, name FROM class_types ORDER BY name ASC').all() as { id: number, name: string }[];

            // 2. Fetch all fencers
            const fencersData = db.prepare('SELECT * FROM fencers ORDER BY last_name ASC, first_name ASC').all() as { id: number, first_name: string, last_name: string, usaf_id: number, last_membership_renewal: string | null }[];

            // 3. Fetch attendance counts grouped by fencer and class type within dates.
            //    Fix #3: Use COALESCE to resolve class_type_id from either the session directly
            //    (for ad-hoc sessions) or via the template (for template-generated sessions).
            //    LEFT JOIN ensures ad-hoc sessions are never silently dropped.
            const attendanceData = db.prepare(`
                SELECT 
                    a.fencer_id,
                    COALESCE(s.class_type_id, t.class_type_id) as class_type_id,
                    COUNT(s.id) as attendance_count
                FROM class_attendees a
                JOIN class_sessions s ON a.class_session_id = s.id
                LEFT JOIN class_templates t ON s.template_id = t.id
                WHERE s.date >= ? AND s.date <= ?
                  AND COALESCE(s.class_type_id, t.class_type_id) IS NOT NULL
                GROUP BY a.fencer_id, COALESCE(s.class_type_id, t.class_type_id)
            `).all(startDate, endDate) as { fencer_id: number, class_type_id: number, attendance_count: number }[];

            // 4. Map the counts
            const attendeeCounts = new Map<number, Map<number, number>>();
            for (const row of attendanceData) {
                if (!attendeeCounts.has(row.fencer_id)) {
                    attendeeCounts.set(row.fencer_id, new Map<number, number>());
                }
                const fMap = attendeeCounts.get(row.fencer_id);
                if (fMap) fMap.set(row.class_type_id, row.attendance_count);
            }

            // 5. Build Headers
            const headers = ['First Name', 'Last Name', 'USAF ID'];
            for (const ct of classTypesData) {
                headers.push(ct.name);
            }
            headers.push('Member Status');

            // 6. Build Rows
            const rows: (string | number)[][] = [];
            const exportDateObj = new Date(endDate); // evaluate member status relative to the end of period

            for (const fencer of fencersData) {
                // Only include those who attended at least 1 class in the period
                if (!attendeeCounts.has(fencer.id)) continue;

                const counts = attendeeCounts.get(fencer.id);
                if (!counts) continue;

                // Calculate member status
                let isMember = 'No';
                if (fencer.last_membership_renewal) {
                    const renewalDate = new Date(fencer.last_membership_renewal);
                    // 1 year from renewal
                    const expiryDate = new Date(renewalDate);
                    // Add 1 year exactly to the date
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

                    if (exportDateObj <= expiryDate) {
                        isMember = 'Yes';
                    }
                }

                const row: (string | number)[] = [fencer.first_name, fencer.last_name, fencer.usaf_id || 0];
                for (const ct of classTypesData) {
                    row.push(counts.get(ct.id) || 0); // Inject the count or 0 mapped safely per column
                }
                row.push(isMember);

                rows.push(row);
            }

            if (rows.length === 0) {
                return { success: false, error: 'No attendance data found for the selected period.' };
            }

            // 7. Write to CSV String
            const csvString = stringify([headers, ...rows]);

            // 8. Trigger File Save Dialog directly in OS
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return { success: false, error: 'No active window found.' };

            const { canceled, filePath } = await dialog.showSaveDialog(win, {
                title: 'Save Attendance Report',
                defaultPath: `Medeo_Attendance_${startDate}_to_${endDate}.csv`,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }]
            });

            if (canceled || !filePath) {
                return { success: false, error: 'Export canceled by user.' };
            }

            fs.writeFileSync(filePath, csvString, 'utf-8');
            return { success: true };

        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    // --- ADMIN PIN ---

    ipcMain.handle('verifyAdminPin', (_, pin: string) => {
        try {
            const inputHash = crypto.createHash('sha256').update(pin).digest('hex');
            const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_pin_hash'").get() as { value: string } | undefined;
            return { success: row?.value === inputHash };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('updateAdminPin', (_, currentPin: string, newPin: string) => {
        try {
            const currentHash = crypto.createHash('sha256').update(currentPin).digest('hex');
            const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_pin_hash'").get() as { value: string } | undefined;
            if (row?.value !== currentHash) {
                return { success: false, error: 'Current PIN is incorrect.' };
            }
            const newHash = crypto.createHash('sha256').update(newPin).digest('hex');
            db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_pin_hash'").run(newHash);
            return { success: true };
        } catch (error: unknown) {
            return { success: false, error: (error as Error).message };
        }
    });
}
