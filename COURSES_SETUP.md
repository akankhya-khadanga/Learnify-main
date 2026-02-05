# Courses Functionality Setup Guide

This guide will help you enable the Courses functionality in Learnify by running the database migration.

> **⚡ RECOMMENDED**: Use the clean migration file `20250111_courses_schema_clean.sql` which automatically handles cleanup and recreation of tables. This is the easiest and most reliable method.

## Quick Setup

### Option 1: Using Supabase Web Dashboard (Recommended)

1. **Open your Supabase project**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Learnify project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Run the clean migration**
   - Copy the entire contents of `supabase/migrations/20250111_courses_schema_clean.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl+Enter`
   - ✅ This will automatically clean up any existing tables and create fresh ones

4. **Verify success**
   - You should see a success message
   - Check the "Table Editor" to confirm the new tables exist:
     - `courses`
     - `modules`
     - `user_course_progress`
     - `course_enrollments`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd c:\Users\M BHUVANESWAR\OneDrive\Documents\Learnify

# Run the migration
supabase db push

# Or run specific migration
supabase migration up
```

## What This Migration Does

The migration creates the complete database schema for courses functionality:

### Tables Created

1. **courses** - Main courses table
   - Stores course metadata (title, description, level, category)
   - Supports multilingual content
   - Tracks published status and ratings
   - AI-generated and user-created courses

2. **modules** - Course content modules
   - Individual lessons within courses
   - Stores content, flashcards, practice tasks
   - Quiz data for each module
   - Ordered by module_number

3. **user_course_progress** - Progress tracking
   - Tracks completed modules per user
   - Stores quiz scores
   - Monitors progress percentage
   - Last accessed timestamps

4. **course_enrollments** - Enrollment management
   - Tracks which users are enrolled in which courses
   - Status tracking (active, completed, dropped, paused)
   - Enrollment dates and completion dates

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Published courses are viewable by everyone
- Unpublished courses only visible to owners
- Users can only modify their own courses and progress
- Comprehensive RLS policies for data protection

### Additional Features

- **Auto-updating timestamps** on all tables
- **Automatic module counting** when modules are added
- **Optimized indexes** for fast queries
- **Data validation** with CHECK constraints

## Verifying the Setup

After running the migration:

1. **Check the courses page** at http://localhost:5173/courses
2. The warning message should disappear
3. You should see the Course Library, My Courses, and AI Course Builder tabs
4. Try using the AI Course Builder to generate a test course

## Troubleshooting

### Error: "column owner_id does not exist" or "relation auth.users does not exist"
**Fixed!** The migration has been updated to avoid foreign key constraints to the auth schema, which can cause issues in some Supabase setups. The current version uses simple UUID fields with security enforced through RLS policies instead.

If you already tried running the old version:
1. Drop the partially created tables:
   ```sql
   DROP TABLE IF EXISTS course_enrollments CASCADE;
   DROP TABLE IF EXISTS user_course_progress CASCADE;
   DROP TABLE IF EXISTS modules CASCADE;
   DROP TABLE IF EXISTS courses CASCADE;
   ```
2. Run the updated migration from `supabase/migrations/20250111_courses_schema.sql`

### "relation already exists" error
This means the tables were already partially created. You can either:
- Ignore the error if it's for specific tables
- Drop existing tables first (⚠️ this will delete data):
  ```sql
  DROP TABLE IF EXISTS course_enrollments CASCADE;
  DROP TABLE IF EXISTS user_course_progress CASCADE;
  DROP TABLE IF EXISTS modules CASCADE;
  DROP TABLE IF EXISTS courses CASCADE;
  ```
  Then run the migration again.

### "permission denied" error
- Make sure you're logged into the correct Supabase project
- Verify you have admin/owner permissions on the project

### Tables created but no data showing
- Check the browser console for errors
- Verify your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Check the Network tab to see if API calls are succeeding

## Next Steps

After the migration is complete:

1. **Test the AI Course Builder**
   - Go to the "AI Course Builder" tab
   - Fill out the questionnaire
   - Generate a personalized course

2. **Browse Course Library**
   - View published courses
   - Check external courses from Udemy/Coursera

3. **Create Your Own Course**
   - As a logged-in user, you can create custom courses
   - Add modules, quizzes, and learning materials

## Support

If you encounter any issues:
- Check the browser console for errors
- Review Supabase logs in the dashboard
- Verify all migration steps completed successfully

---

**Migration File**: `supabase/migrations/20250111_courses_schema.sql`
**Created**: 2026-01-11
**Version**: 1.0
