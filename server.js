const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database('checkin.db');

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_name TEXT NOT NULL,
        equipment_serial TEXT NOT NULL,
        lab_number TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        user_type TEXT NOT NULL,
        panther_id TEXT NOT NULL,
        checkin_date TEXT NOT NULL,
        checkin_time TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Load equipment data
let equipmentData = [];
try {
    const jsonData = fs.readFileSync('equipment_backup_2025-06-30T13-59-30-416Z.json', 'utf8');
    const data = JSON.parse(jsonData);
    equipmentData = data.equipment;
} catch (error) {
    console.error('Error loading equipment data:', error);
}

// Routes

// Home page - Equipment list with QR codes
app.get('/', async (req, res) => {
    try {
        const equipmentWithQR = await Promise.all(
            equipmentData.map(async (equipment) => {
                const qrUrl = `${req.protocol}://${req.get('host')}/checkin/${equipment.serialNumber}`;
                const qrCode = await QRCode.toDataURL(qrUrl);
                return { ...equipment, qrCode };
            })
        );
        res.render('index', { equipment: equipmentWithQR });
    } catch (error) {
        console.error('Error generating QR codes:', error);
        res.status(500).send('Error loading equipment data');
    }
});

// Check-in form page
app.get('/checkin/:serialNumber', (req, res) => {
    const serialNumber = req.params.serialNumber;
    const equipment = equipmentData.find(eq => eq.serialNumber === serialNumber);
    
    if (!equipment) {
        return res.status(404).send('Equipment not found');
    }
    
    res.render('checkin', { equipment });
});

// Handle check-in submission
app.post('/checkin/:serialNumber', (req, res) => {
    const serialNumber = req.params.serialNumber;
    const equipment = equipmentData.find(eq => eq.serialNumber === serialNumber);
    
    if (!equipment) {
        return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    const { firstName, lastName, userType, pantherID } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !userType || !pantherID) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const now = moment();
    const checkinDate = now.format('YYYY-MM-DD');
    const checkinTime = now.format('HH:mm:ss');
    
    // Insert into database
    const stmt = db.prepare(`INSERT INTO checkins 
        (equipment_name, equipment_serial, lab_number, first_name, last_name, user_type, panther_id, checkin_date, checkin_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run([
        equipment.name,
        equipment.serialNumber,
        equipment.lab,
        firstName,
        lastName,
        userType,
        pantherID,
        checkinDate,
        checkinTime
    ], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json({ 
            success: true, 
            message: 'Check-in successful!',
            checkinId: this.lastID 
        });
    });
    
    stmt.finalize();
});

// Admin panel - View all check-ins
app.get('/admin', (req, res) => {
    db.all(`SELECT * FROM checkins ORDER BY timestamp DESC`, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        
        res.render('admin', { checkins: rows });
    });
});

// API endpoint to get check-ins as JSON
app.get('/api/checkins', (req, res) => {
    db.all(`SELECT * FROM checkins ORDER BY timestamp DESC`, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
