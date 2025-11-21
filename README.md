# KNS Training Pass System

A modern QR code-based attendance management system built with Next.js 14, Supabase, and TypeScript.

## Features

- 🔐 Admin authentication system
- 👥 Participant management (add, view participants)
- 📱 QR code generation for each participant
- 📷 QR code scanning for check-in/check-out
- 📸 Photo capture on first check-in
- ✅ Photo verification for subsequent check-ins
- 📧 Automatic email notifications for check-in/check-out
- 📊 Attendance tracking and logs
- 🎨 Beautiful UI with Framer Motion animations
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for QR codes)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **QR Code**: html5-qrcode (scanning), qrcode (generation)
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for server-side operations)

### 3. Create Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the SQL script from `database/schema.sql`:
   ```sql
   -- Copy and paste the entire contents of database/schema.sql
   ```
3. If you set up the project before November 2025, run `database/add_event_type_column.sql` in the Supabase SQL Editor to add the missing `event_type` column:
   ```sql
   -- Copy and paste the entire contents of database/add_event_type_column.sql
   ```
4. If you set up the project before December 2025 (or created the database manually), run `database/add_location_column.sql` in the Supabase SQL Editor to add the `location` column that the admin UI requires:
5. If you see errors mentioning the missing `event_users` table (or if event logins always say the username/password is invalid), run `database/create_event_users_table.sql` to create the table that stores per-event usernames:
   ```sql
   -- Copy and paste the entire contents of database/create_event_users_table.sql
   ```
   ```sql
   -- Copy and paste the entire contents of database/add_location_column.sql
   ```

### 4. Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create two buckets:
   - **Bucket 1:** Name: `qr-codes`, Make it **Public**
   - **Bucket 2:** Name: `participant-photos`, Make it **Public**
3. Click **Create** for each bucket

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=admin123

# Email notifications (optional - see EMAIL_SETUP.md)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=KNS Training <noreply@yourdomain.com>
```

**Important**: 
- Replace the values with your actual Supabase credentials
- Change `ADMIN_PASSWORD` to a secure password
- Never commit `.env.local` to version control

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Admin Access

1. Navigate to `/admin/login`
2. Enter the admin password (default: `admin123` or your custom password)
3. You'll be redirected to the participants dashboard

### Adding Participants

1. Click **Add Participant** in the admin navigation
2. Fill in the required fields (Name, Email)
3. Optional: Add phone and organization
4. Click **Create Participant**
5. A QR code will be automatically generated and stored

### Scanning QR Codes

1. Navigate to `/scan` (or click "Scan QR Code" on the home page)
2. Allow camera permissions
3. Point the camera at a participant's QR code
4. The system will automatically:
   - Check in if it's the first scan of the day
   - Check out if already checked in
   - Show success/error messages

### Viewing Attendance

1. Go to **Attendance** in the admin navigation
2. View all check-in/check-out records
3. See participant details, timestamps, and status

### Email Notifications

The system automatically sends email notifications to participants:
- **Check-In:** "Thank you, [Name]! Have a wonderful session!"
- **Check-Out:** "Check-out successfully, [Name]! See you for tomorrow's session."

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for email service configuration.

## Project Structure

```
├── app/
│   ├── actions/          # Server actions
│   │   ├── auth.ts       # Authentication actions
│   │   ├── participants.ts # Participant CRUD
│   │   └── attendance.ts   # Attendance scanning
│   ├── admin/            # Admin pages
│   │   ├── login/        # Admin login
│   │   ├── add-participant/ # Add new participant
│   │   ├── participants/    # List all participants
│   │   └── attendance/      # Attendance logs
│   ├── scan/             # QR code scanner page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/
│   ├── supabase.ts       # Client-side Supabase client
│   ├── supabase-server.ts # Server-side Supabase client
│   ├── auth.ts           # Authentication utilities
│   └── qrcode.ts         # QR code generation
├── database/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
└── README.md
```

## Security Notes

- Admin password is stored in environment variables
- Session management uses HTTP-only cookies
- Service role key is only used server-side
- QR codes are stored in Supabase Storage with public access

## Production Deployment

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Build the project: `npm run build`
3. Deploy to your preferred platform

## Troubleshooting

### QR Code Not Generating
- Check Supabase Storage bucket exists and is public
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check browser console for errors

### Camera Not Working
- Ensure HTTPS in production (required for camera access)
- Check browser permissions for camera access
- Try a different browser

### Database Errors
- Verify all tables are created correctly
- Check foreign key relationships
- Ensure indexes are created

## License

MIT License - feel free to use this project for your needs.

## Support

For issues or questions, please check the Supabase documentation or Next.js documentation.

