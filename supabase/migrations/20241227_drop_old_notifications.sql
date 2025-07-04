DROP TRIGGER IF EXISTS create_user_notification_preferences ON users;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

DROP FUNCTION IF EXISTS create_default_notification_preferences();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_user_notification_count(UUID);
DROP FUNCTION IF EXISTS mark_notifications_as_read(UUID, UUID[], TEXT);
DROP FUNCTION IF EXISTS cleanup_old_notifications();

DROP POLICY IF EXISTS "Users can view active templates" ON email_templates;
DROP POLICY IF EXISTS "Users can manage own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can manage rules" ON notification_rules;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON notification_subscriptions;
DROP POLICY IF EXISTS "Users can view own analytics" ON notification_analytics;
DROP POLICY IF EXISTS "Users can view own batches" ON notification_batches;

ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_rules DISABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS idx_email_templates_name;
DROP INDEX IF EXISTS idx_email_templates_active;
DROP INDEX IF EXISTS idx_email_templates_category;
DROP INDEX IF EXISTS idx_notification_preferences_user_id;
DROP INDEX IF EXISTS idx_email_queue_notification_id;
DROP INDEX IF EXISTS idx_email_queue_next_attempt;
DROP INDEX IF EXISTS idx_email_queue_priority;
DROP INDEX IF EXISTS idx_email_queue_status;
DROP INDEX IF EXISTS idx_email_queue_tracking_id;
DROP INDEX IF EXISTS idx_email_queue_created_at;
DROP INDEX IF EXISTS idx_notifications_unread;
DROP INDEX IF EXISTS idx_notifications_transaction_id;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_status;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_category;
DROP INDEX IF EXISTS idx_notifications_priority;
DROP INDEX IF EXISTS idx_notifications_scheduled_for;
DROP INDEX IF EXISTS idx_notifications_expires_at;
DROP INDEX IF EXISTS idx_notifications_related_entity;
DROP INDEX IF EXISTS idx_notifications_organization_id;
DROP INDEX IF EXISTS idx_notifications_batch_id;
DROP INDEX IF EXISTS idx_notification_batches_user_id;
DROP INDEX IF EXISTS idx_notification_batches_scheduled;
DROP INDEX IF EXISTS idx_notification_batches_status;
DROP INDEX IF EXISTS idx_notification_analytics_notification_id;
DROP INDEX IF EXISTS idx_notification_analytics_user_id;
DROP INDEX IF EXISTS idx_notification_analytics_event_type;
DROP INDEX IF EXISTS idx_notification_analytics_created_at;
DROP INDEX IF EXISTS idx_notification_subscriptions_user_id;
DROP INDEX IF EXISTS idx_notification_subscriptions_active;
DROP INDEX IF EXISTS idx_notification_rules_active;
DROP INDEX IF EXISTS idx_notification_rules_trigger_event;

DROP TABLE IF EXISTS notification_rules CASCADE;
DROP TABLE IF EXISTS notification_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_analytics CASCADE;
DROP TABLE IF EXISTS notification_batches CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS email_status CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

DROP SEQUENCE IF EXISTS notifications_id_seq CASCADE;
DROP SEQUENCE IF EXISTS email_queue_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notification_preferences_id_seq CASCADE;
DROP SEQUENCE IF EXISTS email_templates_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notification_batches_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notification_analytics_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notification_subscriptions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notification_rules_id_seq CASCADE;

DO $$
BEGIN
  RAISE NOTICE '🧹 Old notification system completely removed!';
  RAISE NOTICE '✅ Ready for simple, focused notification system';
END $$;
