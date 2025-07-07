/**
 * Comprehensive Notification System Test Suite
 * Tests all notification functionality end-to-end
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

class NotificationTestSuite {
  private results: TestResult[] = [];
  private testUsers: any[] = [];
  private testContent: any[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Comprehensive Notification System Tests...\n');

    try {
      // Setup test data
      await this.setupTestData();

      // Core notification tests
      await this.testDatabaseSchema();
      await this.testNotificationCreation();
      await this.testCommentNotifications();
      await this.testReplyNotifications();
      await this.testLikeNotifications();
      await this.testReviewNotifications();
      await this.testMentionDetection();
      await this.testNotificationRetrieval();
      await this.testNotificationMarkAsRead();
      await this.testNotificationDeduplication();
      await this.testRateLimiting();

      // UI/UX tests
      await this.testNotificationBell();
      await this.testNotificationPanel();
      await this.testMentionComponents();

      // Performance tests
      await this.testBatchNotifications();
      await this.testNotificationQueries();

      // Cleanup
      await this.cleanupTestData();

    } catch (error) {
      this.addResult('SETUP', 'FAIL', `Test setup failed: ${error}`, 0);
    }

    this.printResults();
    return this.results;
  }

  private async setupTestData() {
    const startTime = Date.now();
    
    try {
      // Create test users
      const testUserData = [
        { username: 'test_user_1', email: 'test1@example.com', full_name: 'Test User 1' },
        { username: 'test_user_2', email: 'test2@example.com', full_name: 'Test User 2' },
        { username: 'test_user_3', email: 'test3@example.com', full_name: 'Test User 3' }
      ];

      for (const userData of testUserData) {
        const { data: user, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (!error && user) {
          this.testUsers.push(user);
        }
      }

      // Create test content (prompts, agents, tools)
      if (this.testUsers.length >= 2) {
        const contentData = [
          {
            table: 'swarms_cloud_prompts',
            data: {
              name: 'Test Prompt for Notifications',
              description: 'A test prompt for notification testing',
              user_id: this.testUsers[0].id,
              status: 'approved'
            }
          },
          {
            table: 'swarms_cloud_agents',
            data: {
              name: 'Test Agent for Notifications',
              description: 'A test agent for notification testing',
              user_id: this.testUsers[1].id,
              status: 'approved'
            }
          }
        ];

        for (const content of contentData) {
          const { data, error } = await supabase
            .from(content.table as any)
            .insert(content.data)
            .select()
            .single();

          if (!error && data) {
            this.testContent.push({ ...data, type: content.table.replace('swarms_cloud_', '') });
          }
        }
      }

      this.addResult('SETUP', 'PASS', `Created ${this.testUsers.length} test users and ${this.testContent.length} test content items`, Date.now() - startTime);
    } catch (error) {
      this.addResult('SETUP', 'FAIL', `Setup failed: ${error}`, Date.now() - startTime);
    }
  }

  private async testDatabaseSchema() {
    const startTime = Date.now();
    
    try {
      // Test notification tables exist
      const tables = ['swarms_notifications', 'swarms_cloud_comments', 'swarms_cloud_comments_replies'];
      
      for (const table of tables) {
        const { error } = await supabase.from(table as any).select('*').limit(1);
        if (error) {
          throw new Error(`Table ${table} not accessible: ${error.message}`);
        }
      }

      // Test notification types enum
      const { data: notificationTypes, error: enumError } = await supabase
        .rpc('get_enum_values', { enum_name: 'notification_type' });

      if (enumError) {
        throw new Error(`Notification types enum not found: ${enumError.message}`);
      }

      const expectedTypes = ['content_liked', 'content_commented', 'comment_replied', 'content_reviewed', 'user_mentioned'];
      const missingTypes = expectedTypes.filter(type => !notificationTypes?.includes(type));
      
      if (missingTypes.length > 0) {
        throw new Error(`Missing notification types: ${missingTypes.join(', ')}`);
      }

      this.addResult('DATABASE_SCHEMA', 'PASS', 'All required tables and enums exist', Date.now() - startTime);
    } catch (error) {
      this.addResult('DATABASE_SCHEMA', 'FAIL', `Schema validation failed: ${error}`, Date.now() - startTime);
    }
  }

  private async testNotificationCreation() {
    const startTime = Date.now();
    
    try {
      if (this.testUsers.length < 2) {
        throw new Error('Insufficient test users');
      }

      // Test direct notification creation
      const { data: notification, error } = await supabase
        .from('swarms_notifications')
        .insert({
          user_id: this.testUsers[0].id,
          type: 'content_liked',
          title: 'Test Notification',
          message: 'This is a test notification',
          data: { test: true },
          actor_id: this.testUsers[1].id,
          related_type: 'prompt',
          related_id: 'test-id'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      if (!notification) {
        throw new Error('Notification creation returned no data');
      }

      // Verify notification structure
      const requiredFields = ['id', 'user_id', 'type', 'title', 'message', 'status', 'created_at'];
      const missingFields = requiredFields.filter(field => !(field in notification));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing notification fields: ${missingFields.join(', ')}`);
      }

      this.addResult('NOTIFICATION_CREATION', 'PASS', 'Direct notification creation works correctly', Date.now() - startTime);
    } catch (error) {
      this.addResult('NOTIFICATION_CREATION', 'FAIL', `Notification creation failed: ${error}`, Date.now() - startTime);
    }
  }

  private async testCommentNotifications() {
    const startTime = Date.now();
    
    try {
      if (this.testUsers.length < 2 || this.testContent.length < 1) {
        throw new Error('Insufficient test data');
      }

      const content = this.testContent[0];
      const commenter = this.testUsers[1];
      const contentOwner = this.testUsers[0];

      // Create a comment
      const { data: comment, error: commentError } = await supabase
        .from('swarms_cloud_comments')
        .insert({
          model_id: content.id,
          model_type: content.type,
          content: 'This is a test comment for notifications',
          user_id: commenter.id
        })
        .select()
        .single();

      if (commentError || !comment) {
        throw new Error(`Failed to create comment: ${commentError?.message}`);
      }

      // Wait a moment for notification processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if notification was created
      const { data: notifications, error: notifError } = await supabase
        .from('swarms_notifications')
        .select('*')
        .eq('user_id', contentOwner.id)
        .eq('type', 'content_commented')
        .eq('related_id', content.id);

      if (notifError) {
        throw new Error(`Failed to query notifications: ${notifError.message}`);
      }

      if (!notifications || notifications.length === 0) {
        throw new Error('No comment notification was created');
      }

      const notification = notifications[0];
      if (!notification.message.includes(commenter.username)) {
        throw new Error('Notification message does not include commenter username');
      }

      this.addResult('COMMENT_NOTIFICATIONS', 'PASS', 'Comment notifications work correctly', Date.now() - startTime);
    } catch (error) {
      this.addResult('COMMENT_NOTIFICATIONS', 'FAIL', `Comment notification test failed: ${error}`, Date.now() - startTime);
    }
  }

  private async testMentionDetection() {
    const startTime = Date.now();
    
    try {
      if (this.testUsers.length < 3) {
        throw new Error('Insufficient test users for mention testing');
      }

      const mentioner = this.testUsers[0];
      const mentioned = this.testUsers[1];
      const contentOwner = this.testUsers[2];

      // Create content owned by user 3
      const { data: content, error: contentError } = await supabase
        .from('swarms_cloud_prompts')
        .insert({
          name: 'Test Prompt for Mentions',
          description: 'Testing mentions',
          user_id: contentOwner.id,
          status: 'approved'
        })
        .select()
        .single();

      if (contentError || !content) {
        throw new Error(`Failed to create content: ${contentError?.message}`);
      }

      // Create comment with mention
      const { data: comment, error: commentError } = await supabase
        .from('swarms_cloud_comments')
        .insert({
          model_id: content.id,
          model_type: 'prompt',
          content: `Hey @${mentioned.username}, check this out! This is a test mention.`,
          user_id: mentioner.id
        })
        .select()
        .single();

      if (commentError || !comment) {
        throw new Error(`Failed to create comment with mention: ${commentError?.message}`);
      }

      // Wait for mention processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if mention notification was created
      const { data: mentionNotifications, error: mentionError } = await supabase
        .from('swarms_notifications')
        .select('*')
        .eq('user_id', mentioned.id)
        .eq('type', 'user_mentioned');

      if (mentionError) {
        throw new Error(`Failed to query mention notifications: ${mentionError.message}`);
      }

      if (!mentionNotifications || mentionNotifications.length === 0) {
        throw new Error('No mention notification was created');
      }

      const mentionNotif = mentionNotifications[0];
      if (!mentionNotif.message.includes(mentioner.username)) {
        throw new Error('Mention notification does not include mentioner username');
      }

      this.addResult('MENTION_DETECTION', 'PASS', 'Mention detection and notifications work correctly', Date.now() - startTime);
    } catch (error) {
      this.addResult('MENTION_DETECTION', 'FAIL', `Mention detection test failed: ${error}`, Date.now() - startTime);
    }
  }

  private async addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration: number) {
    this.results.push({ test, status, message, duration });
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${statusIcon} ${test}: ${message} (${duration}ms)`);
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`⏱️ Total Duration: ${totalDuration}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
    }
  }

  private async cleanupTestData() {
    try {
      // Clean up test notifications
      await supabase
        .from('swarms_notifications')
        .delete()
        .in('user_id', this.testUsers.map(u => u.id));

      // Clean up test comments
      await supabase
        .from('swarms_cloud_comments')
        .delete()
        .in('user_id', this.testUsers.map(u => u.id));

      // Clean up test content
      for (const content of this.testContent) {
        await supabase
          .from(`swarms_cloud_${content.type}s` as any)
          .delete()
          .eq('id', content.id);
      }

      // Clean up test users
      await supabase
        .from('users')
        .delete()
        .in('id', this.testUsers.map(u => u.id));

      console.log('\n🧹 Test data cleaned up successfully');
    } catch (error) {
      console.log(`⚠️ Cleanup warning: ${error}`);
    }
  }

  private async testReplyNotifications() {
    const startTime = Date.now();

    try {
      if (this.testUsers.length < 3 || this.testContent.length < 1) {
        throw new Error('Insufficient test data');
      }

      const content = this.testContent[0];
      const commenter = this.testUsers[1];
      const replier = this.testUsers[2];

      // Create a comment first
      const { data: comment, error: commentError } = await supabase
        .from('swarms_cloud_comments')
        .insert({
          model_id: content.id,
          model_type: content.type,
          content: 'Original comment for reply testing',
          user_id: commenter.id
        })
        .select()
        .single();

      if (commentError || !comment) {
        throw new Error(`Failed to create comment: ${commentError?.message}`);
      }

      // Create a reply
      const { data: reply, error: replyError } = await supabase
        .from('swarms_cloud_replies')
        .insert({
          comment_id: comment.id,
          content: 'This is a test reply',
          user_id: replier.id
        })
        .select()
        .single();

      if (replyError || !reply) {
        throw new Error(`Failed to create reply: ${replyError?.message}`);
      }

      // Wait for notification processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if reply notification was created
      const { data: notifications, error: notifError } = await supabase
        .from('swarms_notifications')
        .select('*')
        .eq('user_id', commenter.id)
        .eq('type', 'comment_replied');

      if (notifError) {
        throw new Error(`Failed to query reply notifications: ${notifError.message}`);
      }

      if (!notifications || notifications.length === 0) {
        throw new Error('No reply notification was created');
      }

      this.addResult('REPLY_NOTIFICATIONS', 'PASS', 'Reply notifications work correctly', Date.now() - startTime);
    } catch (error) {
      this.addResult('REPLY_NOTIFICATIONS', 'FAIL', `Reply notification test failed: ${error}`, Date.now() - startTime);
    }
  }

  private async testLikeNotifications() {
    const startTime = Date.now();

    try {
      if (this.testUsers.length < 2 || this.testContent.length < 1) {
        throw new Error('Insufficient test data');
      }

      const content = this.testContent[0];
      const commenter = this.testUsers[1];
      const liker = this.testUsers[0];

      // Create a comment to like
      const { data: comment, error: commentError } = await supabase
        .from('swarms_cloud_comments')
        .insert({
          model_id: content.id,
          model_type: content.type,
          content: 'Comment to be liked',
          user_id: commenter.id
        })
        .select()
        .single();

      if (commentError || !comment) {
        throw new Error(`Failed to create comment: ${commentError?.message}`);
      }

      // Create a like
      const { data: like, error: likeError } = await supabase
        .from('swarms_cloud_likes')
        .insert({
          item_id: comment.id,
          item_type: 'comment',
          user_id: liker.id
        })
        .select()
        .single();

      if (likeError || !like) {
        throw new Error(`Failed to create like: ${likeError?.message}`);
      }

      // Wait for notification processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if like notification was created
      const { data: notifications, error: notifError } = await supabase
        .from('swarms_notifications')
        .select('*')
        .eq('user_id', commenter.id)
        .eq('type', 'content_liked');

      if (notifError) {
        throw new Error(`Failed to query like notifications: ${notifError.message}`);
      }

      if (!notifications || notifications.length === 0) {
        throw new Error('No like notification was created');
      }

      this.addResult('LIKE_NOTIFICATIONS', 'PASS', 'Like notifications work correctly', Date.now() - startTime);
    } catch (error) {
      this.addResult('LIKE_NOTIFICATIONS', 'FAIL', `Like notification test failed: ${error}`, Date.now() - startTime);
    }
  }

  private async testReviewNotifications() {
    const startTime = Date.now();

    try {
      if (this.testUsers.length < 2 || this.testContent.length < 1) {
        throw new Error('Insufficient test data');
      }

      const content = this.testContent[0];
      const reviewer = this.testUsers[1];
      const contentOwner = this.testUsers[0];

      // Create a review
      const { data: review, error: reviewError } = await supabase
        .from('swarms_cloud_reviews')
        .insert({
          model_id: content.id,
          model_type: content.type,
          rating: 5,
          comment: 'Great content! This is a test review.',
          user_id: reviewer.id
        })
        .select()
        .single();

      if (reviewError || !review) {
        throw new Error(`Failed to create review: ${reviewError?.message}`);
      }

      // Wait for notification processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if review notification was created
      const { data: notifications, error: notifError } = await supabase
        .from('swarms_notifications')
        .select('*')
        .eq('user_id', contentOwner.id)
        .eq('type', 'content_reviewed');

      if (notifError) {
        throw new Error(`Failed to query review notifications: ${notifError.message}`);
      }

      if (!notifications || notifications.length === 0) {
        throw new Error('No review notification was created');
      }

      this.addResult('REVIEW_NOTIFICATIONS', 'PASS', 'Review notifications work correctly', Date.now() - startTime);
    } catch (error) {
      this.addResult('REVIEW_NOTIFICATIONS', 'FAIL', `Review notification test failed: ${error}`, Date.now() - startTime);
    }
  }
}

// Export for use
export { NotificationTestSuite };

// Run tests if called directly
if (require.main === module) {
  const testSuite = new NotificationTestSuite();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}
