const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'MedeoScheduler', 'database', 'medeo-scheduler.sqlite');
console.log('Reading db from:', dbPath);

const db = new Database(dbPath);
try {
    const classTypes = db.prepare('SELECT * FROM class_types').all();
    console.log('Class Types:', classTypes);
} catch (e) {
    console.error(e);
}
db.close();
