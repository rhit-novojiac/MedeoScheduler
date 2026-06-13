const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'MedeoScheduler', 'database', 'medeo-scheduler.sqlite');
console.log('Seeding db at:', dbPath);

const db = new Database(dbPath);

// Class templates map to these days of week:
// Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6

const templates = [
    // --- MONDAY ---
    {
        class_type_id: 3, // Open Bouting
        name: 'Open Fencing',
        description: 'Sabre/Foil & Youth Epee Open Fencing',
        day_of_week: 1,
        start_time: '16:00',
        duration_minutes: 220,
        weapon: 'all'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Coordination, Speed and Agility',
        description: 'Coordination, speed and agility training',
        day_of_week: 1,
        start_time: '16:20',
        duration_minutes: 40,
        weapon: 'all'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Little Musketeers Class',
        description: 'For young beginners (7-9 y.o.)',
        day_of_week: 1,
        start_time: '17:00',
        duration_minutes: 80,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Competitive Youth EPEE',
        description: 'Competitive youth epee class',
        day_of_week: 1,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Strength Training',
        description: 'Strength training session',
        day_of_week: 1,
        start_time: '18:20',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 1, // Footwork
        name: 'All-Weapon Advanced Footwork',
        description: 'Advanced footwork class',
        day_of_week: 1,
        start_time: '18:40',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 3, // Open Bouting
        name: 'EPEE Open Fencing',
        description: 'Epee open fencing night',
        day_of_week: 1,
        start_time: '19:30',
        duration_minutes: 150,
        weapon: 'epee'
    },

    // --- TUESDAY ---
    {
        class_type_id: 2, // Situational Bouting
        name: 'FW & Situational Fencing',
        description: 'Footwork & Situational Fencing',
        day_of_week: 2,
        start_time: '16:00',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Competitive Youth EPEE',
        description: 'Competitive youth epee class',
        day_of_week: 2,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Beginner FOIL',
        description: 'Beginner foil class',
        day_of_week: 2,
        start_time: '17:30',
        duration_minutes: 100,
        weapon: 'foil'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Strength/Recovery',
        description: 'Strength/Recovery session',
        day_of_week: 2,
        start_time: '17:40',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Y-14/Cadet/JR EPEE Competitive Fencing',
        description: 'Competitive fencing class',
        day_of_week: 2,
        start_time: '18:40',
        duration_minutes: 60,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Int/Adv Sabre',
        description: 'Intermediate/Advanced Sabre class',
        day_of_week: 2,
        start_time: '19:00',
        duration_minutes: 100,
        weapon: 'saber'
    },
    {
        class_type_id: 3, // Open Bouting
        name: 'Post-Class Open Bouting',
        description: 'Epee, FOIL & SABRE Post-Class Bouting',
        day_of_week: 2,
        start_time: '19:30',
        duration_minutes: 150,
        weapon: 'all'
    },

    // --- WEDNESDAY ---
    {
        class_type_id: 3, // Open Bouting
        name: 'Open Fencing',
        description: 'Open fencing session',
        day_of_week: 3,
        start_time: '16:00',
        duration_minutes: 210,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Youth/Teen Beg/Int EPEE',
        description: 'Youth/Teen Beginner/Intermediate Epee',
        day_of_week: 3,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Competitive Youth EPEE',
        description: 'Competitive youth epee class',
        day_of_week: 3,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Intermediate FOIL',
        description: 'Intermediate foil class',
        day_of_week: 3,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'foil'
    },
    {
        class_type_id: 1, // Footwork
        name: 'All Weapon Advanced Footwork',
        description: 'Advanced footwork class',
        day_of_week: 3,
        start_time: '18:40',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Advanced FOIL',
        description: 'Advanced foil class',
        day_of_week: 3,
        start_time: '19:30',
        duration_minutes: 100,
        weapon: 'foil'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Div 1 (A,B,C) Situational Fencing',
        description: 'Div 1 Situational Fencing class',
        day_of_week: 3,
        start_time: '19:40',
        duration_minutes: 80,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Div 3 EPEE Situational Fencing',
        description: 'Div 3 Epee Situational Fencing class',
        day_of_week: 3,
        start_time: '19:40',
        duration_minutes: 80,
        weapon: 'epee'
    },
    {
        class_type_id: 3, // Open Bouting
        name: 'Post-Class Open Bouting',
        description: 'Medeo members only Open Bouting',
        day_of_week: 3,
        start_time: '19:30',
        duration_minutes: 150,
        weapon: 'all'
    },

    // --- THURSDAY ---
    {
        class_type_id: 3, // Open Bouting
        name: 'Youth EPEE Open Fencing',
        description: 'Members only youth epee open fencing',
        day_of_week: 4,
        start_time: '16:00',
        duration_minutes: 60,
        weapon: 'epee'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Little Musketeers Class',
        description: 'For young beginners (7-9 y.o.)',
        day_of_week: 4,
        start_time: '17:00',
        duration_minutes: 80,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Competitive Youth EPEE',
        description: 'Competitive youth epee class',
        day_of_week: 4,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Tech/Tact. FW',
        description: 'Technical and Tactical Footwork',
        day_of_week: 4,
        start_time: '18:00',
        duration_minutes: 30,
        weapon: 'all'
    },
    {
        class_type_id: 1, // Footwork
        name: 'Y14/Cadet/JR All Weapon Footwork',
        description: 'All Weapon Footwork class',
        day_of_week: 4,
        start_time: '18:40',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 3, // Open Bouting
        name: 'EPEE Open Fencing',
        description: 'Epee open fencing night',
        day_of_week: 4,
        start_time: '19:30',
        duration_minutes: 150,
        weapon: 'epee'
    },

    // --- FRIDAY ---
    {
        class_type_id: 1, // Footwork
        name: 'Coordination, Speed and Agility',
        description: 'Coordination, speed and agility training',
        day_of_week: 5,
        start_time: '16:20',
        duration_minutes: 40,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Competitive Youth EPEE',
        description: 'Competitive youth epee class',
        day_of_week: 5,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'FW & Situational Fencing',
        description: 'Footwork & Situational Fencing',
        day_of_week: 5,
        start_time: '17:00',
        duration_minutes: 100,
        weapon: 'all'
    },
    {
        class_type_id: 1, // Footwork
        name: 'SABRE Footwork',
        description: 'Sabre footwork class',
        day_of_week: 5,
        start_time: '18:00',
        duration_minutes: 60,
        weapon: 'saber'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Int/Adv FOIL',
        description: 'Intermediate/Advanced Foil class',
        day_of_week: 5,
        start_time: '18:00',
        duration_minutes: 120,
        weapon: 'foil'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Intermediate/Advance Teen EPEE Situational Fencing',
        description: 'Teen EPEE Situational Fencing class',
        day_of_week: 5,
        start_time: '18:40',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 3, // Open Bouting
        name: 'Post-Class Open Bouting',
        description: 'Epee, FOIL & SABRE Post-Class Bouting',
        day_of_week: 5,
        start_time: '20:00',
        duration_minutes: 120,
        weapon: 'all'
    },

    // --- SATURDAY ---
    {
        class_type_id: 2, // Situational Bouting
        name: 'Y10/Y12-14 EPEE',
        description: 'Youth Epee class',
        day_of_week: 6,
        start_time: '09:00',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Intermediate/Advanced Sabre',
        description: 'Intermediate/Advanced Sabre class',
        day_of_week: 6,
        start_time: '10:40',
        duration_minutes: 100,
        weapon: 'saber'
    },
    {
        class_type_id: 1, // Footwork
        name: 'All Weapon Footwork',
        description: 'All Weapon Footwork class',
        day_of_week: 6,
        start_time: '10:40',
        duration_minutes: 60,
        weapon: 'all'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Div 1 EPEE Situational Fencing',
        description: 'Div 1 Epee Situational Fencing class',
        day_of_week: 6,
        start_time: '11:40',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Intermediate EPEE Situational Fencing',
        description: 'Intermediate Epee Situational Fencing class',
        day_of_week: 6,
        start_time: '11:40',
        duration_minutes: 100,
        weapon: 'epee'
    },
    {
        class_type_id: 2, // Situational Bouting
        name: 'Beginner SABRE',
        description: 'Beginner Sabre class',
        day_of_week: 6,
        start_time: '13:00',
        duration_minutes: 80,
        weapon: 'saber'
    },
    {
        class_type_id: 3, // Open Bouting
        name: 'Open Bouting',
        description: 'Open Bouting All Day (10AM - 4PM)',
        day_of_week: 6,
        start_time: '10:00',
        duration_minutes: 360,
        weapon: 'all'
    }
];

// Ensure the schema columns exist by running the migration step directly
try {
    const ctCols = db.pragma('table_info(class_templates)').map(c => c.name);
    if (!ctCols.includes('weapon')) {
        db.exec('ALTER TABLE class_templates ADD COLUMN weapon TEXT');
        console.log('Added weapon column to class_templates');
    }
    const csCols = db.pragma('table_info(class_sessions)').map(c => c.name);
    if (!csCols.includes('weapon')) {
        db.exec('ALTER TABLE class_sessions ADD COLUMN weapon TEXT');
        console.log('Added weapon column to class_sessions');
    }
} catch (e) {
    console.error('Failed to run local migration in seeding script:', e);
}

try {
    db.transaction(() => {
        // Clear existing templated sessions first to respect foreign key constraint
        db.prepare('DELETE FROM class_sessions WHERE template_id IS NOT NULL').run();
        console.log('Cleared existing templated class sessions.');

        // Clear existing templates to avoid duplicates
        db.prepare('DELETE FROM class_templates').run();
        console.log('Cleared existing class templates.');

        const insertStmt = db.prepare(`
            INSERT INTO class_templates (class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const t of templates) {
            insertStmt.run(t.class_type_id, t.name, t.description, t.day_of_week, t.start_time, t.duration_minutes, t.weapon);
        }
    })();
    console.log(`Successfully seeded ${templates.length} class templates.`);
} catch (e) {
    console.error('Error seeding templates:', e);
} finally {
    db.close();
}
