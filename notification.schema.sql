-- Comprehensive Notification System for Swarms Platform
-- Handles all notification types with enterprise-grade features

-- Notification types enum
CREATE TYPE notification_type AS ENUM (
  'marketplace_purchase',
  'marketplace_sale', 
  'marketplace_commission',
  'system_alert',
  'account_update',
  'organization_invite',
  'credit_update',
  'subscription_update'
);

-- Notification status enum  
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent', 
  'failed',
  'read'
);

-- Email delivery status enum
CREATE TYPE email_status AS ENUM (
  'queued',
  'sending',
  'sent',
  'delivered',
  'failed',
  'bounced'
);

-- Main notifications table - stores all notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- User targeting
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  
  -- Notification content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional structured data
  
  -- Status tracking
  status notification_status DEFAULT 'pending' NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Related entities (for marketplace notifications)
  transaction_id UUID,
  item_id UUID,
  item_type TEXT,
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_id UUID -- Reference to email_queue
);

-- Email queue for reliable email delivery
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Email details
  to_email TEXT NOT NULL,
  from_email TEXT DEFAULT 'noreply@swarms.world' NOT NULL,
  reply_to TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- Delivery tracking
  status email_status DEFAULT 'queued' NOT NULL,
  priority INTEGER DEFAULT 5 NOT NULL, -- 1 = highest, 10 = lowest
  
  -- Retry logic
  attempts INTEGER DEFAULT 0 NOT NULL,
  max_attempts INTEGER DEFAULT 3 NOT NULL,
  next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_error TEXT,
  
  -- Performance tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  processing_time_ms INTEGER,
  
  -- Related notification
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  
  -- Template info
  template_name TEXT,
  template_data JSONB DEFAULT '{}'
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true NOT NULL,
  email_frequency TEXT DEFAULT 'immediate' NOT NULL, -- immediate, daily, weekly
  
  -- Notification type preferences
  marketplace_notifications BOOLEAN DEFAULT true NOT NULL,
  system_notifications BOOLEAN DEFAULT true NOT NULL,
  account_notifications BOOLEAN DEFAULT true NOT NULL,
  organization_notifications BOOLEAN DEFAULT true NOT NULL,
  marketing_notifications BOOLEAN DEFAULT false NOT NULL,
  
  -- Delivery preferences
  timezone TEXT DEFAULT 'UTC' NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  
  -- Quiet hours (optional)
  quiet_hours_enabled BOOLEAN DEFAULT false NOT NULL,
  quiet_hours_start TIME,
  quiet_hours_end TIME
);

-- Email templates for consistent branding
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Template identification
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Template content
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  
  -- Template metadata
  required_variables TEXT[] DEFAULT '{}' NOT NULL,
  optional_variables TEXT[] DEFAULT '{}' NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_transaction_id ON notifications(transaction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, status) WHERE status != 'read';

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_next_attempt ON email_queue(next_attempt_at) WHERE status IN ('queued', 'failed');
CREATE INDEX IF NOT EXISTS idx_email_queue_notification_id ON email_queue(notification_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Email queue is system-managed (no user access)
-- Templates are read-only for users
CREATE POLICY "Users can view active templates" ON email_templates
  FOR SELECT USING (is_active = true);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default preferences when user is created
CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();
