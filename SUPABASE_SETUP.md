# Supabase Setup Guide for DevNotesByRithish

Complete A-Z guide to set up Supabase for your ebook library.

---

## Step 1: Create a Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier available)
2. Click **"New Project"**
3. Choose your organization (or create one)
4. Fill in:
   - **Project name**: `devnotes-by-rithish`
   - **Database password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"** and wait ~2 minutes for setup

---

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (keep secret!)

---

## Step 3: Create the Books Table

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create books table
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster category filtering
CREATE INDEX idx_books_category ON books(category);

-- Create index for search
CREATE INDEX idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX idx_books_author ON books USING gin(to_tsvector('english', author));

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read books
CREATE POLICY "Allow public read access" ON books
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert books (you can restrict this later)
CREATE POLICY "Allow public insert" ON books
  FOR INSERT WITH CHECK (true);

-- Create policy to allow updates (for download count)
CREATE POLICY "Allow public update" ON books
  FOR UPDATE USING (true);
```

---

## Step 4: Create Storage Bucket for PDFs

1. Go to **Storage** in your Supabase dashboard
2. Click **"New bucket"**
3. Settings:
   - **Name**: `ebooks`
   - **Public bucket**: Toggle ON (so users can download)
4. Click **"Create bucket"**

5. Set up storage policies - go to **Storage** → **Policies** tab
6. Click **"New Policy"** for the `ebooks` bucket and add these policies:

**Policy 1: Allow public downloads**
```sql
-- Go to Storage > Policies > New Policy for 'ebooks' bucket
-- Name: "Allow public downloads"
-- Allowed operation: SELECT
-- Policy definition:
true
```

**Policy 2: Allow public uploads**
```sql
-- Name: "Allow public uploads"  
-- Allowed operation: INSERT
-- Policy definition:
true
```

Or use the SQL Editor to create policies:
```sql
-- Allow anyone to view/download files
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ebooks');

-- Allow anyone to upload files
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ebooks');
```

---

## Step 5: Set Environment Variables

Add these environment variables to your project:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

For **Vercel deployment**:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable above

---

## Step 6: Test Your Setup

After setting up, your app should be able to:
1. Upload PDF files to Supabase Storage
2. Save book metadata to the database
3. Fetch and display all books
4. Download PDFs directly from Supabase Storage

---

## Useful Supabase SQL Commands

**View all books:**
```sql
SELECT * FROM books ORDER BY created_at DESC;
```

**Delete a book:**
```sql
DELETE FROM books WHERE id = 'book-uuid-here';
```

**Search books:**
```sql
SELECT * FROM books 
WHERE title ILIKE '%javascript%' 
   OR author ILIKE '%javascript%';
```

**Get books by category:**
```sql
SELECT * FROM books WHERE category = 'JavaScript';
```

**Get download stats:**
```sql
SELECT title, download_count 
FROM books 
ORDER BY download_count DESC 
LIMIT 10;
```

---

## Troubleshooting

**Error: "relation books does not exist"**
- Make sure you ran the SQL to create the table

**Error: "new row violates row-level security policy"**
- Check that RLS policies are set up correctly

**Error: "bucket not found"**
- Make sure you created the `ebooks` storage bucket

**Files not downloading:**
- Verify the storage bucket is set to public
- Check storage policies allow SELECT

---

## Next Steps

1. For production, consider adding authentication to restrict uploads
2. Add file size limits in storage policies
3. Set up automatic file cleanup for deleted books
