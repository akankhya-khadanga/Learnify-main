# Phase 1 Features - Quick Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
All dependencies are already installed:
- vite-plugin-pwa, workbox-window
- react-pdf, pdfjs-dist, fabric
- recharts
- resend, @react-email/components

### 2. Run Database Migrations

```bash
# Navigate to your Supabase project
cd supabase

# Run migrations
supabase migration up
```

This will create:
- PDF documents and annotations tables
- Study sessions tracking tables
- Habits and completions tables
- All necessary RLS policies

### 3. Update User Profiles Table

Add email preference columns:

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS weekly_reports_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_reports_enabled BOOLEAN DEFAULT false;
```

### 4. Configure Environment

Add to `.env.local`:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

Get your Resend API key from: https://resend.com/api-keys

### 5. Test PWA

```bash
npm run dev
```

Visit http://localhost:8080 and check:
- Chrome DevTools → Application → Manifest
- Install button should appear in address bar

### 6. Integration Checklist

- [ ] Add StudyPatternAnalysis to Profile page
- [ ] Add HabitTracker to Dashboard
- [ ] Add PDF upload to Notes page
- [ ] Create Supabase Edge Function for emails
- [ ] Test all features

## 📝 Notes

- PWA will only work in production or with HTTPS
- PDF annotations require user authentication
- Email reports need Resend API key configured
- Study analytics need active sessions to display data

## 🐛 Troubleshooting

**PWA not installing?**
- Check manifest.json is accessible at /manifest.json
- Verify HTTPS or localhost
- Check browser console for errors

**PDF not loading?**
- Verify PDF.js worker URL in PDFAnnotator.tsx
- Check Supabase storage bucket 'pdfs' exists
- Verify RLS policies allow user access

**Habits not saving?**
- Check database migrations ran successfully
- Verify user_id matches authenticated user
- Check browser console for errors

---

For detailed documentation, see `walkthrough.md`
