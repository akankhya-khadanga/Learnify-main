-- Email Notification System Test Script
-- Run these queries to verify the email system is working correctly

-- =====================================================
-- TEST 1: Check Tables Exist
-- =====================================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('exam_email_notifications', 'user_notification_preferences')
ORDER BY table_name;

-- Expected: 2 rows (both tables exist)

-- =====================================================
-- TEST 2: Check Trigger Function Exists
-- =====================================================
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition_preview
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'create_exam_notifications';

-- Expected: 1 row (function exists)

-- =====================================================
-- TEST 3: Check Trigger Attached
-- =====================================================
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'exam_schedules'
  AND t.tgname = 'exam_notification_trigger';

-- Expected: 1 row (trigger exists and enabled)

-- =====================================================
-- TEST 4: Check RLS Policies
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('exam_email_notifications', 'user_notification_preferences')
ORDER BY tablename, policyname;

-- Expected: Multiple rows (RLS policies configured)

-- =====================================================
-- TEST 5: Create Test Exam (Replace user_id with yours)
-- =====================================================
DO $$
DECLARE
  test_user_id UUID;
  test_exam_id UUID;
BEGIN
  -- Get first user from auth.users (or use your specific user_id)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Create a user first.';
    RETURN;
  END IF;

  -- Insert test exam 7 days from now
  INSERT INTO exam_schedules (
    user_id,
    exam_name,
    exam_date,
    exam_time,
    subject,
    location,
    duration_minutes,
    importance
  ) VALUES (
    test_user_id,
    'Email Test Exam - ' || NOW()::TEXT,
    CURRENT_DATE + INTERVAL '7 days',
    '14:00:00',
    'Computer Science',
    'Lab 101',
    180,
    'high'
  ) RETURNING id INTO test_exam_id;

  RAISE NOTICE 'Created test exam with ID: %', test_exam_id;
END $$;

-- =====================================================
-- TEST 6: Verify Notifications Created
-- =====================================================
SELECT 
  en.id,
  es.exam_name,
  en.notification_type,
  en.scheduled_time,
  en.status,
  en.recipient_email,
  EXTRACT(EPOCH FROM (en.scheduled_time - NOW())) / 3600 AS hours_until_send
FROM exam_email_notifications en
JOIN exam_schedules es ON en.exam_id = es.id
WHERE es.exam_name LIKE 'Email Test Exam%'
ORDER BY en.scheduled_time;

-- Expected: 4 rows (7_days, 3_days, 1_day, immediate)

-- =====================================================
-- TEST 7: Check Notification Schedule Logic
-- =====================================================
WITH test_exam AS (
  SELECT * FROM exam_schedules 
  WHERE exam_name LIKE 'Email Test Exam%' 
  ORDER BY created_at DESC 
  LIMIT 1
)
SELECT 
  te.exam_name,
  te.exam_date,
  te.exam_time,
  en.notification_type,
  en.scheduled_time,
  -- Verify scheduled time calculation
  CASE en.notification_type
    WHEN '7_days' THEN (te.exam_date - INTERVAL '7 days')::TEXT
    WHEN '3_days' THEN (te.exam_date - INTERVAL '3 days')::TEXT
    WHEN '1_day' THEN (te.exam_date - INTERVAL '1 day')::TEXT
    WHEN 'immediate' THEN ((te.exam_date || ' ' || te.exam_time)::TIMESTAMP - INTERVAL '2 hours')::TEXT
  END AS expected_time,
  en.scheduled_time::TEXT AS actual_time,
  (en.scheduled_time = 
    CASE en.notification_type
      WHEN '7_days' THEN (te.exam_date || ' 09:00:00')::TIMESTAMP - INTERVAL '7 days'
      WHEN '3_days' THEN (te.exam_date || ' 09:00:00')::TIMESTAMP - INTERVAL '3 days'
      WHEN '1_day' THEN (te.exam_date || ' 09:00:00')::TIMESTAMP - INTERVAL '1 day'
      WHEN 'immediate' THEN (te.exam_date || ' ' || COALESCE(te.exam_time, '09:00:00'))::TIMESTAMP - INTERVAL '2 hours'
    END
  ) AS time_correct
FROM test_exam te
JOIN exam_email_notifications en ON en.exam_id = te.id
ORDER BY en.scheduled_time;

-- Expected: All time_correct = true

-- =====================================================
-- TEST 8: Check User Preferences Table
-- =====================================================
SELECT 
  u.email,
  np.email_notifications_enabled,
  np.notify_7_days_before,
  np.notify_3_days_before,
  np.notify_1_day_before,
  np.notify_on_exam_day,
  np.preferred_notification_time,
  np.timezone
FROM auth.users u
LEFT JOIN user_notification_preferences np ON u.id = np.user_id
LIMIT 5;

-- Expected: User rows with preferences (or NULL if not set)

-- =====================================================
-- TEST 9: Simulate Pending Notification Query
-- =====================================================
-- This mimics what the Edge Function does
SELECT 
  en.id,
  en.recipient_email,
  en.subject,
  en.notification_type,
  en.scheduled_time,
  es.exam_name,
  es.exam_date,
  es.exam_time,
  EXTRACT(EPOCH FROM (NOW() - en.scheduled_time)) / 60 AS minutes_overdue
FROM exam_email_notifications en
JOIN exam_schedules es ON en.exam_id = es.id
WHERE en.status = 'pending'
  AND en.scheduled_time <= NOW()
ORDER BY en.scheduled_time
LIMIT 10;

-- Expected: Only notifications that are due now

-- =====================================================
-- TEST 10: Check Notification Status Distribution
-- =====================================================
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM exam_email_notifications
GROUP BY status
ORDER BY count DESC;

-- Expected: Shows distribution of pending/sent/failed

-- =====================================================
-- TEST 11: Verify Email Content
-- =====================================================
SELECT 
  subject,
  LEFT(body, 100) as body_preview,
  notification_type
FROM exam_email_notifications
WHERE exam_id IN (
  SELECT id FROM exam_schedules 
  WHERE exam_name LIKE 'Email Test Exam%' 
  LIMIT 1
)
ORDER BY notification_type;

-- Expected: 4 different email subjects matching notification type

-- =====================================================
-- TEST 12: Check Retry Logic
-- =====================================================
SELECT 
  id,
  recipient_email,
  status,
  retry_count,
  error_message,
  updated_at
FROM exam_email_notifications
WHERE retry_count > 0
ORDER BY updated_at DESC
LIMIT 10;

-- Expected: Shows failed emails with retry attempts

-- =====================================================
-- CLEANUP: Remove Test Data
-- =====================================================
-- Uncomment to delete test exams and notifications
/*
DELETE FROM exam_schedules 
WHERE exam_name LIKE 'Email Test Exam%';

-- Notifications will be auto-deleted via CASCADE
*/

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Queue Size (notifications waiting to send)
SELECT COUNT(*) as pending_notifications
FROM exam_email_notifications
WHERE status = 'pending';

-- Next 5 Scheduled
SELECT 
  es.exam_name,
  en.notification_type,
  en.scheduled_time,
  EXTRACT(EPOCH FROM (en.scheduled_time - NOW())) / 3600 AS hours_until_send
FROM exam_email_notifications en
JOIN exam_schedules es ON en.exam_id = es.id
WHERE en.status = 'pending'
ORDER BY en.scheduled_time
LIMIT 5;

-- Failed in Last 24 Hours
SELECT 
  recipient_email,
  subject,
  error_message,
  retry_count
FROM exam_email_notifications
WHERE status = 'failed'
  AND updated_at > NOW() - INTERVAL '24 hours';

-- Success Rate (Last 7 Days)
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as emails_sent
FROM exam_email_notifications
WHERE status = 'sent'
  AND sent_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
