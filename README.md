# CEE Lab Equipment Check-in System

A Node.js web application for managing equipment check-ins in CEE labs using QR codes.

## Features

- 📱 **QR Code Check-in**: Each equipment has a unique QR code for easy mobile check-in
- 📝 **User-friendly Forms**: Simple form to collect user information (name, type, Panther ID)
- 📊 **Admin Panel**: View all check-in records in a searchable, sortable table
- 💾 **Data Export**: Export check-in data to CSV format
- 📱 **Mobile Responsive**: Works seamlessly on mobile devices
- 🔄 **Real-time Updates**: Instant check-in processing and confirmation

## System Requirements

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Main page: http://localhost:3005
   - Admin panel: http://localhost:3005/admin

## Usage

### For Equipment Users
1. Scan the QR code on any equipment using your mobile device
2. Fill out the check-in form with your information:
   - First Name
   - Last Name
   - User Type (Faculty/Student/Staff/Visitor)
   - Panther ID
3. Click "Check In" to complete the process

### For Administrators
1. Visit the admin panel at `/admin`
2. View all check-in records in a sortable table
3. Use the search function to find specific records
4. Export data to CSV for further analysis
5. View statistics including total check-ins, today's activity, etc.

## Data Structure

The application uses the existing JSON equipment data with the following structure:
- Equipment name, category, lab, serial number, model, status
- Check-in records are stored in a SQLite database with timestamps

## Database Schema

The application creates a SQLite database (`checkin.db`) with the following table:

```sql
CREATE TABLE checkins (
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
);
```

## QR Code URLs

Each equipment generates a unique URL in the format:
```
http://your-domain.com/checkin/[SERIAL_NUMBER]
```

## File Structure

```
/
├── server.js                 # Main application server
├── package.json              # Dependencies and scripts
├── checkin.db                # SQLite database (auto-created)
├── equipment_backup_*.json   # Equipment data source
├── views/                    # EJS templates
│   ├── index.ejs            # Equipment list with QR codes
│   ├── checkin.ejs          # Check-in form
│   └── admin.ejs            # Admin panel
└── public/                   # Static files
    └── style.css            # Custom styles
```

## Customization

- **Equipment Data**: The system automatically loads from the JSON backup file
- **Styling**: Modify `public/style.css` for custom appearance
- **User Types**: Edit the dropdown options in `views/checkin.ejs`
- **Database**: SQLite database can be replaced with other databases if needed

## Security Considerations

- Input validation on all form fields
- SQL injection protection using prepared statements
- XSS protection through proper templating

## Troubleshooting

1. **Port already in use**: Change the PORT in server.js or set environment variable
2. **Database errors**: Ensure write permissions in the application directory
3. **QR codes not generating**: Check internet connection for QR code library

## Future Enhancements

- Equipment checkout functionality
- User authentication/authorization
- Equipment usage analytics
- Email notifications
- Equipment images in QR code pages
- Barcode scanning support
