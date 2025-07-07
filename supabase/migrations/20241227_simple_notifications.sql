-- Simple, Focused Notification System for Swarms Platform
-- Covers social interactions (likes, comments, reviews) with scalable foundation
-- This migration should run AFTER 20241227_drop_old_notifications.sql

-- Log the start of installation
DO $$
BEGIN
  RAISE NOTICE '🚀 Installing simple, focused notification system...';
  RAISE NOTICE '📱 Focus: Social interactions (likes, comments, reviews)';
  RAISE NOTICE '🔮 Future: Marketplace & referral notifications';
END $$;

-- Simple notification types - FOCUSED ON SOCIAL INTERACTIONS
CREATE TYPE notification_type AS ENUM (
  -- 🎯 SOCIAL INTERACTIONS (Current Priority)
  'content_liked',        -- Someone liked your prompt/agent/tool
  'content_commented',    -- Someone commented on your content
  'content_reviewed',     -- Someone reviewed your content
  'content_rated',        -- Someone rated your content
  'user_followed',        -- Someone followed you
  'user_mentioned',       -- Someone mentioned you in a comment
  'content_approved',     -- Your content was approved
  'content_rejected',     -- Your content was rejected

  -- 🔔 SYSTEM NOTIFICATIONS (Basic)
  'system_announcement',  -- Platform announcements
  'account_update',       -- Account changes
  'security_alert',       -- Security warnings

  -- 🔮 FUTURE PLACEHOLDERS (Not implemented yet)
  'marketplace_purchase', -- Future: marketplace notifications
  'marketplace_sale',
  'marketplace_commission',
  'referral_signup',      -- Future: referral notifications
  'referral_reward',
  'org_invite',           -- Future: organization notifications
  'org_update'
);

-- Simple notification status
CREATE TYPE notification_status AS ENUM (
  'unread',
  'read',
  'archived'
);

-- Main notifications table - simple and focused
CREATE TABLE IF NOT EXISTS swarms_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- User targeting
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}' NOT NULL, -- Additional structured data
  
  -- Status
  status notification_status DEFAULT 'unread' NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Related content (for social notifications)
  related_type TEXT, -- 'prompt', 'agent', 'tool', 'comment', 'user'
  related_id UUID,
  
  -- Actor (who performed the action)
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Optional action URL
  action_url TEXT
);

-- User notification preferences - simple settings (in-app only for now)
CREATE TABLE IF NOT EXISTS swarms_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Global settings
  notifications_enabled BOOLEAN DEFAULT true NOT NULL,

  -- Category preferences (current focus: social)
  social_notifications BOOLEAN DEFAULT true NOT NULL,
  system_notifications BOOLEAN DEFAULT true NOT NULL,

  -- Future categories (placeholders)
  marketplace_notifications BOOLEAN DEFAULT true NOT NULL,
  referral_notifications BOOLEAN DEFAULT true NOT NULL,

  -- Quiet hours (optional)
  quiet_hours_enabled BOOLEAN DEFAULT false NOT NULL,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC' NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_user_id ON swarms_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_status ON swarms_notifications(status);
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_type ON swarms_notifications(type);
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_created_at ON swarms_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_unread ON swarms_notifications(user_id, status) WHERE status = 'unread';
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_related ON swarms_notifications(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_swarms_notifications_actor ON swarms_notifications(actor_id) WHERE actor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_swarms_notification_preferences_user_id ON swarms_notification_preferences(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE swarms_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarms_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON swarms_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON swarms_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON swarms_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Service role can manage all notifications (for system notifications)
CREATE POLICY "Service role can manage all notifications" ON swarms_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- No database functions needed - using server/router pattern instead

-- Auto-update timestamps (shared function used by many tables)
-- Using CREATE OR REPLACE to ensure it exists without conflicts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_swarms_notifications_updated_at 
  BEFORE UPDATE ON swarms_notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swarms_notification_preferences_updated_at 
  BEFORE UPDATE ON swarms_notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON swarms_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON swarms_notification_preferences TO authenticated;
GRANT ALL ON swarms_notifications TO service_role;
GRANT ALL ON swarms_notification_preferences TO service_role;

-- Create default notification preferences for existing users
INSERT INTO swarms_notification_preferences (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM swarms_notification_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Log successful installation
DO $$
DECLARE
  notification_count INTEGER;
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO notification_count FROM swarms_notifications;
  SELECT COUNT(*) INTO user_count FROM swarms_notification_preferences;
  
  RAISE NOTICE '✅ Social-focused notification system installed!';
  RAISE NOTICE '📊 Statistics:';
  RAISE NOTICE '   - Notifications: %', notification_count;
  RAISE NOTICE '   - User preferences: %', user_count;
  RAISE NOTICE '🎯 CURRENT FOCUS: Social interactions (likes, comments, reviews, follows)';
  RAISE NOTICE '📱 In-app notifications only (no email service)';
  RAISE NOTICE '🔮 Future-ready: Marketplace & referral placeholders included';
  RAISE NOTICE '🔒 Row Level Security policies applied';
  RAISE NOTICE '🚀 Ready to integrate with your server/router pattern!';
END $$;
