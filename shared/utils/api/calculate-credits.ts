'use server';

import Decimal from 'decimal.js';
import {
  getUserCredit,
  getUserCreditPlan,
  supabaseAdmin,
} from '../supabase/admin';
import { getOrganizationOwner } from './organization';

export async function checkRemainingCredits(
  userId: string,
  organizationId: string | null,
) {
  let id = userId;

  if (organizationId) {
    // Fetch the organization owner's user ID
    const orgOwnerId = await getOrganizationOwner(organizationId);
    if (!orgOwnerId)
      return {
        status: 400,
        remainingCredits: 0,
        message: 'Organization owner not found',
        credit_plan: 'default',
      };

    id = orgOwnerId ?? '';
  }

  const [credits, credit_plan] = await Promise.all([
    getUserCredit(id),
    getUserCreditPlan(id),
  ]);

  const remainingCredits = credits.credit + credits.free_credit;

  if (remainingCredits <= 0 && credit_plan === 'default') {
    const status = organizationId ? 402 : 400;
    const message = organizationId
      ? 'Insufficient organization credits'
      : 'No remaining credits';

    return {
      status,
      message,
      remainingCredits,
      credit_plan,
    };
  }

  return {
    status: 200,
    remainingCredits: 0,
    message: 'Success',
    credit_plan,
  };
}

export async function calculateRemainingCredit(
  totalAPICost: number,
  userId: string,
  organizationId: string | null,
): Promise<
  | {
      status: number;
      message: string;
    }
  | undefined
> {
  if (totalAPICost <= 0) return;

  let id = userId;

  if (organizationId) {
    // Fetch the organization owner's user ID
    const orgOwnerId = await getOrganizationOwner(organizationId);
    if (!orgOwnerId)
      return {
        status: 500,
        message: 'Internal server error - invoice organization not found for calc rem credits',
      };

    id = orgOwnerId ?? '';
  }

  try {
    const { credit, free_credit } = await getUserCredit(id);

    const decimalTotalAPICost = new Decimal(totalAPICost);
    let newCredit = new Decimal(credit);
    let newFreeCredit = new Decimal(free_credit);

    if (newFreeCredit.greaterThan(0)) {
      if (newFreeCredit.greaterThanOrEqualTo(decimalTotalAPICost)) {
        newFreeCredit = newFreeCredit.minus(decimalTotalAPICost);
      } else {
        const remainingCost = decimalTotalAPICost.minus(newFreeCredit);
        newFreeCredit = new Decimal(0);
        newCredit = newCredit.minus(remainingCost);
      }
    } else {
      newCredit = newCredit.minus(decimalTotalAPICost);
    }

    await supabaseAdmin.from('swarms_cloud_users_credits').upsert(
      {
        user_id: id,
        credit: newCredit.toNumber(),
        free_credit: newFreeCredit.toNumber(),
      },
      {
        onConflict: 'user_id',
      },
    );

    return {
      status: 200,
      message: 'Remaining credit calculated successfully',
    };
  } catch (error) {
    console.error('Error calculating remaining credit:', error);
    return { status: 500, message: 'Internal server error - Calc rem credits' };
  }
}
