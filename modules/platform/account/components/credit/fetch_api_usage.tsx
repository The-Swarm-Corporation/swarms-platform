import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
);

// Interface
export interface ApiActivity {
  user_id: string;
  total_cost: number;
}

export interface UserTotalCharge {
  user_id: string;
  total_charge: number;
}

/**
 * Fetches the total charges from the last month for each user.
 *
 * @returns A Promise that resolves to a Map object where the keys are user IDs and the values are the total charges.
 * @throws If there is an error fetching the total charges.
 */
export async function fetchTotalChargesLastMonth(): Promise<UserTotalCharge[]> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  try {
    // Fetch the total costs from the last month for each user
    const { data, error } = await supabase
      .from('swarms_cloud_api_activities')
      .select('user_id, total_cost')
      .gte('created_at', oneMonthAgo.toISOString())
      .not('total_cost', 'is', null);

    if (error) {
      console.error('Error fetching total charges last month:', error);
      throw new Error('Error fetching total charges last month');
    }

    // Create a map to accumulate total charges per user
    const totalChargesMap = new Map<string, number>();
    data.forEach((activity) => {
      totalChargesMap.set(
        activity.user_id,
        (totalChargesMap.get(activity.user_id) || 0) + activity.total_cost,
      );
    });

    // Convert the map to an array of objects
    const totalCharges: UserTotalCharge[] = Array.from(totalChargesMap).map(
      ([user_id, total_charge]) => ({
        user_id,
        total_charge,
      }),
    );

    return totalCharges;
  } catch (error) {
    console.error('Error fetching total charges last month:', error);
    throw new Error('Error fetching total charges last month');
  }
}

// Usage example
fetchTotalChargesLastMonth()
    .then((totalCharges) => {
        console.log('Total charges last month:', totalCharges);
    })
    .catch((error) => {
        console.error('Failed to fetch total charges last month:', error);
    });