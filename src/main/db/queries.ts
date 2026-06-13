import type { Database } from 'better-sqlite3';
import type { Fencer, ClassType, ClassTemplate, ClassSession, SpecialEvent } from '../../preload/index';

// ---------------------------------------------------------------------------
// Fencers
// ---------------------------------------------------------------------------

export const getFencers = (db: Database, limit?: number, offset?: number) => {
    let query = 'SELECT * FROM fencers ORDER BY last_name ASC, first_name ASC';
    if (limit !== undefined && offset !== undefined) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
    }
    return db.prepare(query).all();
};

export const getFencersCount = (db: Database) => {
    return (db.prepare('SELECT COUNT(*) as count FROM fencers').get() as { count: number }).count;
};

export const createFencer = (db: Database, fencer: Omit<Fencer, 'id'>) =>
    db.prepare(`
        INSERT INTO fencers (first_name, last_name, sex, year_of_birth, usaf_id, last_membership_renewal, is_foil, is_epee, is_saber)
        VALUES (@first_name, @last_name, @sex, @year_of_birth, @usaf_id, @last_membership_renewal, @is_foil, @is_epee, @is_saber)
    `).run(fencer);

export const updateFencer = (db: Database, fencer: Fencer) =>
    db.prepare(`
        UPDATE fencers
        SET first_name = @first_name, last_name = @last_name, sex = @sex, year_of_birth = @year_of_birth,
            usaf_id = @usaf_id, last_membership_renewal = @last_membership_renewal, is_foil = @is_foil, is_epee = @is_epee, is_saber = @is_saber
        WHERE id = @id
    `).run(fencer);

// ---------------------------------------------------------------------------
// Class Types
// ---------------------------------------------------------------------------

export const getClassTypes = (db: Database) =>
    db.prepare('SELECT * FROM class_types ORDER BY name ASC').all();

export const createClassType = (db: Database, classType: Omit<ClassType, 'id'>) =>
    db.prepare(`
        INSERT INTO class_types (name, member_price, non_member_price)
        VALUES (@name, @member_price, @non_member_price)
    `).run(classType);

export const updateClassType = (db: Database, classType: ClassType) =>
    db.prepare(`
        UPDATE class_types
        SET name = @name, member_price = @member_price, non_member_price = @non_member_price
        WHERE id = @id
    `).run(classType);

export const deleteClassType = (db: Database, id: number) =>
    db.prepare('DELETE FROM class_types WHERE id = ?').run(id);

// ---------------------------------------------------------------------------
// Class Templates
// ---------------------------------------------------------------------------

export const getClassTemplates = (db: Database, limit?: number, offset?: number) => {
    let query = `
        SELECT
            t.*,
            c.name as class_type_name
        FROM class_templates t
        LEFT JOIN class_types c ON t.class_type_id = c.id
        ORDER BY t.day_of_week ASC, t.start_time ASC
    `;
    if (limit !== undefined && offset !== undefined) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
    }
    return db.prepare(query).all();
};

export const getClassTemplatesCount = (db: Database) => {
    return (db.prepare('SELECT COUNT(*) as count FROM class_templates').get() as { count: number }).count;
};

export const createClassTemplate = (db: Database, template: Omit<ClassTemplate, 'id' | 'class_type_name'>) =>
    db.prepare(`
        INSERT INTO class_templates (class_type_id, name, description, day_of_week, start_time, duration_minutes)
        VALUES (@class_type_id, @name, @description, @day_of_week, @start_time, @duration_minutes)
    `).run(template);

export const updateClassTemplate = (db: Database, template: Omit<ClassTemplate, 'class_type_name'>) =>
    db.prepare(`
        UPDATE class_templates
        SET class_type_id = @class_type_id, name = @name, description = @description,
            day_of_week = @day_of_week, start_time = @start_time, duration_minutes = @duration_minutes
        WHERE id = @id
    `).run(template);

export const deleteClassTemplate = (db: Database, id: number) =>
    db.prepare('DELETE FROM class_templates WHERE id = ?').run(id);

// ---------------------------------------------------------------------------
// Class Sessions
// ---------------------------------------------------------------------------

/** Auto-instantiate template sessions for a given date + day-of-week. */
export const insertTemplatedSessions = (db: Database, date: string, dayOfWeek: number) =>
    db.prepare(`
        INSERT INTO class_sessions (template_id, class_type_id, name, date, start_time, duration_minutes)
        SELECT t.id, t.class_type_id, t.name, ?, t.start_time, t.duration_minutes
        FROM class_templates t
        WHERE t.day_of_week = ?
          AND NOT EXISTS (
              SELECT 1 FROM class_sessions s
              WHERE s.template_id = t.id AND s.date = ?
          )
    `).run(date, dayOfWeek, date);

/** Fetch all sessions for a date with enriched JOIN data including attendee count. */
export const getSessionsByDate = (db: Database, date: string) =>
    db.prepare(`
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
    `).all(date);

export const createClassSession = (db: Database, session: Omit<ClassSession, 'id' | 'template_name' | 'description' | 'class_type_name' | 'attendee_count'>) =>
    db.prepare(`
        INSERT INTO class_sessions (template_id, class_type_id, name, date, start_time, duration_minutes)
        VALUES (@template_id, @class_type_id, @name, @date, @start_time, @duration_minutes)
    `).run(session);

export const deleteClassSession = (db: Database, id: number) =>
    db.prepare('DELETE FROM class_sessions WHERE id = ?').run(id);

export const updateClassSession = (db: Database, session: Pick<ClassSession, 'id' | 'name' | 'class_type_id' | 'start_time' | 'duration_minutes'>) =>
    db.prepare(`
        UPDATE class_sessions
        SET name            = @name,
            class_type_id   = @class_type_id,
            start_time      = @start_time,
            duration_minutes= @duration_minutes
        WHERE id = @id
    `).run(session);

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export const getAttendeesForSession = (db: Database, sessionId: number) =>
    db.prepare(`
        SELECT f.*, a.fraction
        FROM fencers f
        JOIN class_attendees a ON f.id = a.fencer_id
        WHERE a.class_session_id = ?
    `).all(sessionId);

export const addAttendee = (db: Database, sessionId: number, fencerId: number, fraction: number = 1.0) =>
    db.prepare(`
        INSERT INTO class_attendees (class_session_id, fencer_id, fraction)
        VALUES (?, ?, ?)
        ON CONFLICT(class_session_id, fencer_id) DO UPDATE SET fraction = excluded.fraction
    `).run(sessionId, fencerId, fraction);

export const removeAttendee = (db: Database, sessionId: number, fencerId: number) =>
    db.prepare('DELETE FROM class_attendees WHERE class_session_id = ? AND fencer_id = ?').run(sessionId, fencerId);

// ---------------------------------------------------------------------------
// Coaches
// ---------------------------------------------------------------------------

export const getCoachesForSession = (db: Database, sessionId: number) =>
    db.prepare(`
        SELECT f.*
        FROM fencers f
        JOIN class_coaches c ON f.id = c.coach_id
        WHERE c.class_session_id = ?
    `).all(sessionId);

export const addCoach = (db: Database, sessionId: number, coachId: number) =>
    db.prepare('INSERT OR IGNORE INTO class_coaches (class_session_id, coach_id) VALUES (?, ?)').run(sessionId, coachId);

export const removeCoach = (db: Database, sessionId: number, coachId: number) =>
    db.prepare('DELETE FROM class_coaches WHERE class_session_id = ? AND coach_id = ?').run(sessionId, coachId);

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const getClassTypesForReport = (db: Database) =>
    db.prepare('SELECT id, name FROM class_types ORDER BY name ASC').all() as { id: number; name: string }[];

export const getFencersForReport = (db: Database) =>
    db.prepare('SELECT * FROM fencers ORDER BY last_name ASC, first_name ASC').all() as {
        id: number; first_name: string; last_name: string; usaf_id: number; last_membership_renewal: string | null;
    }[];

export const getAttendanceByPeriod = (db: Database, startDate: string, endDate: string) =>
    db.prepare(`
        SELECT
            a.fencer_id,
            COALESCE(s.class_type_id, t.class_type_id) as class_type_id,
            SUM(a.fraction) as attendance_count
        FROM class_attendees a
        JOIN class_sessions s ON a.class_session_id = s.id
        LEFT JOIN class_templates t ON s.template_id = t.id
        WHERE s.date >= ? AND s.date <= ?
          AND COALESCE(s.class_type_id, t.class_type_id) IS NOT NULL
        GROUP BY a.fencer_id, COALESCE(s.class_type_id, t.class_type_id)
    `).all(startDate, endDate);

// ---------------------------------------------------------------------------
// Settings (Admin PIN)
// ---------------------------------------------------------------------------

export const getSettingByKey = (db: Database, key: string) =>
    db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;

export const updateSettingByKey = (db: Database, value: string, key: string) =>
    db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(value, key);

// ---------------------------------------------------------------------------
// Special Events
// ---------------------------------------------------------------------------

export const getSpecialEventsByDate = (db: Database, date: string) =>
    db.prepare(`
        SELECT * FROM special_events 
        WHERE date = ? OR (is_annual = 1 AND strftime('%m-%d', date) = strftime('%m-%d', ?))
    `).all(date, date);

export const createSpecialEvent = (db: Database, event: Omit<SpecialEvent, 'id'>) =>
    db.prepare(`
        INSERT INTO special_events (name, type, date, cancels_classes, is_annual, excluded_class_ids)
        VALUES (@name, @type, @date, @cancels_classes, @is_annual, @excluded_class_ids)
    `).run(event);

export const updateSpecialEvent = (db: Database, event: SpecialEvent) =>
    db.prepare(`
        UPDATE special_events
        SET name = @name,
            type = @type,
            date = @date,
            cancels_classes = @cancels_classes,
            is_annual = @is_annual,
            excluded_class_ids = @excluded_class_ids
        WHERE id = @id
    `).run(event);

export const deleteSpecialEvent = (db: Database, id: number) =>
    db.prepare('DELETE FROM special_events WHERE id = ?').run(id);
