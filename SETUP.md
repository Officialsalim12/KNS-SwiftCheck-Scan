# Quick Setup Guide

## Step 1: Install Dependencies ✅
```bash
npm install
```
**Status: Already done!**

## Step 2: Set Up Supabase

### 2.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Wait for the project to be ready (takes 1-2 minutes)

### 2.2 Get Your Supabase Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (long string starting with `eyJ...`) - **Keep this secret!**

### 2.3 Create Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `database/schema.sql`
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### 2.4 Create Storage Bucket
1. In Supabase dashboard, go to **Storage**
2. Click **Create Bucket**
3. Name: `qr-codes`
4. **Make it Public** (toggle the switch)
5. Click **Create**

## Step 3: Configure Environment Variables

1. Create a file named `.env.local` in the root directory (same level as `package.json`)
2. Add these lines (replace with your actual Supabase values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD=admin123
```

**Important:**
- Replace all the placeholder values with your actual Supabase credentials
- Change `ADMIN_PASSWORD` to a secure password (this is your admin login password)
- Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 4: Run the Application

```bash
npm run dev
```

The app will start at: **http://localhost:3000**

## Step 5: Access the System

1. **Home Page**: http://localhost:3000
2. **Admin Login**: http://localhost:3000/admin/login
   - Use the password you set in `ADMIN_PASSWORD`
3. **QR Scanner**: http://localhost:3000/scan

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the root directory
- Check that all three Supabase variables are set correctly
- Restart the dev server after creating/updating `.env.local`

### QR codes not generating
- Verify the `qr-codes` storage bucket exists and is public
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key)

### Database errors
- Make sure you ran the `database/schema.sql` script
- Check that tables `participants` and `attendance` exist in your Supabase database

### Camera not working (for scanning)
- Make sure you're using HTTPS in production (required for camera access)
- Check browser permissions for camera access
- Try a different browser (Chrome/Firefox work best)

## Next Steps

1. Login as admin
2. Add your first participant
3. The QR code will be automatically generated
4. Test scanning the QR code at `/scan`

