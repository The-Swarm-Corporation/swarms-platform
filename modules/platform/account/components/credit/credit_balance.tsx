import React, { useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
);

// Schema
export interface UserCredit {
  user_id: string;
  credit: number;
  free_credit: number;
  free_credit_expire_date: string | null;
}

/**
 * Updates the balance of a user.
 *
 * @param userId - The ID of the user.
 * @param amount - The amount to be added or subtracted from the balance.
 * @param type - The type of transaction, either 'credit' or 'debit'.
 * @returns A Promise that resolves to void.
 */
export async function updateBalance(
  userId: string,
  amount: number,
  type: 'credit' | 'debit',
): Promise<void> {
  try {
    const currentDate = new Date().toISOString();

    // Retrieve current credit details
    const { data: creditDetails, error: creditError } = await supabase
      .from('swarms_cloud_users_credits')
      .select('credit, free_credit, free_credit_expire_date')
      .eq('user_id', userId)
      .single();

    if (creditError) throw creditError;

    let { credit, free_credit, free_credit_expire_date } = creditDetails;

    if (type === 'debit') {
      // Check if free credits are available and not expired
      if (
        free_credit > 0 &&
        -free_credit_expire_date &&
        new Date(free_credit_expire_date) > new Date()
      ) {
        if (free_credit >= amount) {
          // Deduct from free credits only
          free_credit -= amount;
          amount = 0;
        } else {
          // Deduct all free credits and reduce the amount accordingly
          amount -= free_credit;
          free_credit = 0;
        }
      }

      // Proceed to deduct remaining amount from paid credits if any amount is left
      if (amount > 0) {
        if (credit >= amount) {
          credit -= amount;
        } else {
          throw new Error('Insufficient funds');
        }
      }
    } else if (type === 'credit') {
      // Simply add the amount to the credit balance
      credit += amount;
    }

    // Update the credit details in the database
    const { error: updateError } = await supabase
      .from('swarms_cloud_users_credits')
      .update({
        credit: credit,
        free_credit: free_credit,
        free_credit_expire_date: free_credit_expire_date, // assuming no change to the expiration date on credit
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    console.log(
      `Balance updated. New credit: ${credit}, New free credit: ${free_credit}`,
    );
  } catch (error) {
    console.error('Failed to update balance:', error);
  }
}
