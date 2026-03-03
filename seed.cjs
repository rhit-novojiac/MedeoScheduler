const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { app } = require('electron');

app.whenReady().then(() => {
    // Path to MedeoScheduler's SQLite DB
    const appDataPath = path.join(app.getPath('userData'), 'database');
    const dbPath = path.join(appDataPath, 'medeo-scheduler.sqlite');

    console.log('Connecting to database at:', dbPath);

    if (!fs.existsSync(dbPath)) {
        console.error(`Database file not found at ${dbPath}!`);
        process.exit(1);
    }

    const db = new Database(dbPath);

    console.log('Seeding fake fencers...');

    const fencers = [
        { first: 'Alexander', last: 'Massialas', yob: 1994, sex: 'M', foil: 1, epee: 0, saber: 0 },
        { first: 'Lee', last: 'Kiefer', yob: 1994, sex: 'F', foil: 1, epee: 0, saber: 0 },
        { first: 'Gerek', last: 'Meinhardt', yob: 1990, sex: 'M', foil: 1, epee: 0, saber: 0 },
        { first: 'Romain', last: 'Cannone', yob: 1997, sex: 'M', foil: 0, epee: 1, saber: 0 },
        { first: 'Sun', last: 'Yiwen', yob: 1992, sex: 'F', foil: 0, epee: 1, saber: 0 },
        { first: 'Aron', last: 'Szilagyi', yob: 1990, sex: 'M', foil: 0, epee: 0, saber: 1 },
        { first: 'Olga', last: 'Kharlan', yob: 1990, sex: 'F', foil: 0, epee: 0, saber: 1 },
        { first: 'Miles', last: 'Chamley-Watson', yob: 1989, sex: 'M', foil: 1, epee: 0, saber: 0 },
        { first: 'Mariel', last: 'Zagunis', yob: 1985, sex: 'F', foil: 0, epee: 0, saber: 1 },
        { first: 'Ruben', last: 'Limardo', yob: 1985, sex: 'M', foil: 0, epee: 1, saber: 0 },
        { first: 'Alice', last: 'Volpi', yob: 1992, sex: 'F', foil: 1, epee: 0, saber: 0 },
        { first: 'Eli', last: 'Dershwitz', yob: 1995, sex: 'M', foil: 0, epee: 0, saber: 1 },
        { first: 'Katrina', last: 'Lehis', yob: 1994, sex: 'F', foil: 0, epee: 1, saber: 0 },
        { first: 'Daryl', last: 'Homer', yob: 1990, sex: 'M', foil: 0, epee: 0, saber: 1 },
        { first: 'Ysaora', last: 'Thibus', yob: 1991, sex: 'F', foil: 1, epee: 0, saber: 0 },
        { first: 'Max', last: 'Heinzer', yob: 1987, sex: 'M', foil: 0, epee: 1, saber: 0 }
    ];

    const insertFencer = db.prepare(`
    INSERT INTO fencers (first_name, last_name, year_of_birth, sex, is_foil, is_epee, is_saber, last_membership_renewal) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

    db.transaction(() => {
        for (const f of fencers) {
            // give everyone a membership renewal from start of this year
            const renewal = new Date(new Date().getFullYear(), 0, 1).toISOString();
            insertFencer.run(f.first, f.last, f.yob, f.sex, f.foil, f.epee, f.saber, renewal);
        }
    })();

    console.log('Seeding class types...');

    const classTypes = [
        { name: 'Footwork', member_price: 15, non_member_price: 25 },
        { name: 'Situational Bouting', member_price: 20, non_member_price: 35 },
        { name: 'Open Bouting', member_price: 10, non_member_price: 20 },
        { name: 'Conditioning', member_price: 15, non_member_price: 25 }
    ];

    const insertClassType = db.prepare(`
    INSERT OR IGNORE INTO class_types (name, member_price, non_member_price) VALUES (?, ?, ?)
`);

    db.transaction(() => {
        for (const ct of classTypes) {
            insertClassType.run(ct.name, ct.member_price, ct.non_member_price);
        }
    })();

    // Get the inserted class type IDs to create templates
    const typeRows = db.prepare('SELECT id, name FROM class_types').all();
    const typeMap = {};
    for (const r of typeRows) {
        typeMap[r.name] = r.id;
    }

    console.log('Seeding class templates for this week...');

    const templates = [
        // Today: Monday (1)
        { type_id: typeMap['Footwork'], name: 'Monday Footwork', desc: 'Core balance and distance control', day: 1, time: '17:00', duration: 60 },
        { type_id: typeMap['Open Bouting'], name: 'Monday Open Bouting', desc: 'Free electric bouting', day: 1, time: '18:00', duration: 120 },

        // Tuesday (2)
        { type_id: typeMap['Situational Bouting'], name: 'Tuesday Tactical', desc: '14-14 scenarios, priority', day: 2, time: '17:30', duration: 90 },
        { type_id: typeMap['Conditioning'], name: 'Tuesday Sprints', desc: 'Anaerobic threshold training', day: 2, time: '19:00', duration: 45 },

        // Wednesday (3)
        { type_id: typeMap['Footwork'], name: 'Wednesday Footwork', desc: 'Advanced tempo changes', day: 3, time: '17:00', duration: 60 },
        { type_id: typeMap['Open Bouting'], name: 'Wednesday Open Bouting', desc: 'Free electric bouting', day: 3, time: '18:00', duration: 120 },

        // Thursday (4)
        { type_id: typeMap['Situational Bouting'], name: 'Thursday Tactical', desc: 'Attacking preparation', day: 4, time: '17:30', duration: 90 },

        // Friday (5)
        { type_id: typeMap['Open Bouting'], name: 'Friday Fight Night', desc: 'Competitive club tournament style', day: 5, time: '18:00', duration: 180 },

        // Saturday (6)
        { type_id: typeMap['Conditioning'], name: 'Saturday Morning Conditioning', desc: 'Endurance and core', day: 6, time: '09:00', duration: 60 },
        { type_id: typeMap['Open Bouting'], name: 'Saturday Open Fencing', desc: 'All weapons', day: 6, time: '10:00', duration: 180 }
    ];

    const insertTemplate = db.prepare(`
    INSERT INTO class_templates (class_type_id, name, description, day_of_week, start_time, duration_minutes) 
    VALUES (?, ?, ?, ?, ?, ?)
`);

    db.transaction(() => {
        // Clear old templates so we don't spam if ran multiple times
        db.prepare('DELETE FROM class_templates').run();

        for (const t of templates) {
            // Adjust the day of week to match Date.getDay() 
            // Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
            insertTemplate.run(t.type_id, t.name, t.desc, t.day, t.time, t.duration);
        }
    })();

    console.log('Seeder completed successfully! 16 fencers and 10 class templates generated.');
    db.close();
    app.quit();
});
