## PDF Viewer Troubleshooting Guide

### Issue: "Failed to load PDF"

This error occurs when the PDF file cannot be loaded. Here are the solutions:

### 1. **Configure Supabase Storage (REQUIRED)**

Run this SQL in your Supabase SQL Editor:

```sql
-- Create pdfs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set CORS policy
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'pdfs';
```

### 2. **Make Bucket Public in Supabase Dashboard**

1. Go to Storage → pdfs bucket
2. Click "Configuration"
3. Toggle "Public bucket" to ON
4. Save changes

### 3. **Test PDF Upload**

After configuring storage:
1. Go to Notes → PDF Viewer tab
2. Upload a PDF file
3. The PDF should now display correctly

### 4. **Check Browser Console**

If still not working, press F12 and check Console tab for errors:
- CORS errors → Storage bucket not public
- 404 errors → File not uploaded correctly
- Worker errors → PDF.js worker not loading

### 5. **Alternative: Use Test PDF**

To verify the viewer works, you can test with a public PDF:
- Open browser console (F12)
- Type: `window.testPDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'`
- This will help isolate if the issue is with Supabase or the PDF viewer itself

---

**Next Steps:**
1. Configure Supabase storage bucket as shown above
2. Try uploading a PDF again
3. If still not working, check browser console for specific errors
