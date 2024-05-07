import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface Customer {
  id: string; // UUID of the customer record, linked to auth.users.id
  stripe_customer_id: string; // Stripe customer ID
}

// Function to fetch Stripe customer ID for a given user ID
async function fetchStripeCustomerId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single(); // Using .single() as we expect only one record for each user

  if (error) {
    console.error('Error fetching Stripe customer ID:', error);
    throw new Error('Failed to fetch Stripe customer ID');
  }

  return data ? data.stripe_customer_id : null;
}

export default fetchStripeCustomerId;
