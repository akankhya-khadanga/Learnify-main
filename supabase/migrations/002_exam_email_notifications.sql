-- Exam Email Notifications Table
-- Stores email notification preferences and history
-- All times are stored in IST (Indian Standard Time - Asia/Kolkata, UTC+5:30)

CREATE TABLE IF NOT EXISTS exam_email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('immediate', '1_day', '3_days', '7_days')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  
  -- Email Content
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate notifications
  UNIQUE(exam_id, notification_type)
);

-- User Email Notification Preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  notification_email TEXT, -- If different from auth email
  
  -- Timing preferences (days before exam)
  notify_7_days_before BOOLEAN DEFAULT true,
  notify_3_days_before BOOLEAN DEFAULT true,
  notify_1_day_before BOOLEAN DEFAULT true,
  notify_on_exam_day BOOLEAN DEFAULT true,
  
  -- Notification time preferences
  preferred_notification_time TIME DEFAULT '12:00:00',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON exam_email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_exam_id ON exam_email_notifications(exam_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_scheduled_time ON exam_email_notifications(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON exam_email_notifications(status);

-- Enable Row Level Security
ALTER TABLE exam_email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_email_notifications
DROP POLICY IF EXISTS "Users can view own email notifications" ON exam_email_notifications;
CREATE POLICY "Users can view own email notifications"
  ON exam_email_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email notifications" ON exam_email_notifications;
CREATE POLICY "Users can insert own email notifications"
  ON exam_email_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can update email notifications" ON exam_email_notifications;
CREATE POLICY "Service role can update email notifications"
  ON exam_email_notifications FOR UPDATE
  USING (true);

-- RLS Policies for user_notification_preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can view own notification preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically create notification records when exam is created
CREATE OR REPLACE FUNCTION create_exam_notifications()
RETURNS TRIGGER AS $$
DECLARE
  user_prefs RECORD;
  notification_email TEXT;
  exam_datetime TIMESTAMPTZ;
BEGIN
  -- Get user preferences
  SELECT * INTO user_prefs
  FROM user_notification_preferences
  WHERE user_id = NEW.user_id;
  
  -- If no preferences exist, use defaults
  IF user_prefs IS NULL THEN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.user_id)
    RETURNING * INTO user_prefs;
  END IF;
  
  -- Skip if email notifications disabled
  IF NOT user_prefs.email_notifications_enabled THEN
    RETURN NEW;
  END IF;
  
  -- Get notification email (use preference or auth email)
  SELECT COALESCE(user_prefs.notification_email, email)
  INTO notification_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Calculate exam datetime
  exam_datetime := (NEW.exam_date + COALESCE(NEW.exam_time, '00:00:00'::TIME))::TIMESTAMPTZ;
  
  -- Create 7-day notification
  IF user_prefs.notify_7_days_before AND exam_datetime > NOW() + INTERVAL '7 days' THEN
    INSERT INTO exam_email_notifications (
      user_id, exam_id, notification_type, scheduled_time, recipient_email, subject, body
    ) VALUES (
      NEW.user_id,
      NEW.id,
      '7_days',
      exam_datetime - INTERVAL '7 days',
      notification_email,
      '📚 Exam Reminder: ' || NEW.exam_name || ' in 7 days',
      'Your exam "' || NEW.exam_name || '" is scheduled for ' || NEW.exam_date || '. Start preparing now!'
    ) ON CONFLICT (exam_id, notification_type) DO NOTHING;
  END IF;
  
  -- Create 3-day notification
  IF user_prefs.notify_3_days_before AND exam_datetime > NOW() + INTERVAL '3 days' THEN
    INSERT INTO exam_email_notifications (
      user_id, exam_id, notification_type, scheduled_time, recipient_email, subject, body
    ) VALUES (
      NEW.user_id,
      NEW.id,
      '3_days',
      exam_datetime - INTERVAL '3 days',
      notification_email,
      '⚠️ Exam Alert: ' || NEW.exam_name || ' in 3 days',
      'Your exam "' || NEW.exam_name || '" is coming up on ' || NEW.exam_date || '. Final revision time!'
    ) ON CONFLICT (exam_id, notification_type) DO NOTHING;
  END IF;
  
  -- Create 1-day notification
  IF user_prefs.notify_1_day_before AND exam_datetime > NOW() + INTERVAL '1 day' THEN
    INSERT INTO exam_email_notifications (
      user_id, exam_id, notification_type, scheduled_time, recipient_email, subject, body
    ) VALUES (
      NEW.user_id,
      NEW.id,
      '1_day',
      exam_datetime - INTERVAL '1 day',
      notification_email,
      '🚨 Final Reminder: ' || NEW.exam_name || ' TOMORROW',
      'Your exam "' || NEW.exam_name || '" is tomorrow at ' || COALESCE(NEW.exam_time::TEXT, 'TBD') || '. Good luck!'
    ) ON CONFLICT (exam_id, notification_type) DO NOTHING;
  END IF;
  
  -- Create exam day notification
  IF user_prefs.notify_on_exam_day THEN
    INSERT INTO exam_email_notifications (
      user_id, exam_id, notification_type, scheduled_time, recipient_email, subject, body
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'immediate',
      exam_datetime - INTERVAL '2 hours',
      notification_email,
      '🎯 TODAY: ' || NEW.exam_name || ' Exam',
      'Your exam "' || NEW.exam_name || '" is TODAY at ' || COALESCE(NEW.exam_time::TEXT, 'TBD') || ' at ' || COALESCE(NEW.location, 'your exam location') || '. You''ve got this!'
    ) ON CONFLICT (exam_id, notification_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notifications on exam insert/update
DROP TRIGGER IF EXISTS trigger_create_exam_notifications ON exam_schedules;
CREATE TRIGGER trigger_create_exam_notifications
  AFTER INSERT OR UPDATE OF exam_date, exam_time
  ON exam_schedules
  FOR EACH ROW
  EXECUTE FUNCTION create_exam_notifications();
