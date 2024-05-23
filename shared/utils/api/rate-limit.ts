import { supabaseAdmin } from '../supabase/admin';

const rateLimitWindow = 60 * 1000; // 1 minute in milliseconds
const rateLimitMaxRequests = 10; // Maximum allowed requests per window

export async function checkRateLimit(userId: string): Promise<boolean> {
  // Fetch user's existing request count and last request timestamp
  const { data, error } = await supabaseAdmin
    .from('swarms_cloud_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching rate limit data:', error);
    return false;
  }

  const userLimitData = data;

  // Check if user record exists and create a new entry for the user
  if (!userLimitData) {
    const currentTime = Date.now();
    await supabaseAdmin.from('swarms_cloud_rate_limits').insert([
      {
        user_id: userId,
        request_count: 1,
        last_request_at: new Date(currentTime).toISOString(),
      },
    ]);
    return true;
  }

  const currentTime = Date.now();
  const lastRequestAtString = userLimitData?.last_request_at;
  let timeSinceLastRequest = currentTime;

  if (lastRequestAtString) {
    const lastRequestTime = new Date(lastRequestAtString).getTime();
    timeSinceLastRequest = currentTime - lastRequestTime;
  }

  // Reset request count if beyond the rate limit window
  if (timeSinceLastRequest > rateLimitWindow) {
    await supabaseAdmin
      .from('rate_limits')
      .update({ request_count: 1, last_request_at: currentTime })
      .eq('user_id', userId);
    return true;
  }

  // Check if user has exceeded request limit
  if (
    userLimitData.request_count &&
    userLimitData.request_count >= rateLimitMaxRequests
  ) {
    return false;
  }

  // Update request count and timestamp
  await supabaseAdmin
    .from('rate_limits')
    .update({
      request_count: (userLimitData.request_count ?? 0) + 1,
      last_request_at: currentTime,
    })
    .eq('user_id', userId);

  return true;
}
