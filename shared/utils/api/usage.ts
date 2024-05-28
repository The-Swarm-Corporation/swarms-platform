import { supabaseAdmin } from '../supabase/admin';

export type DailyCost = {
  date: string;
  totalCost: number;
  invoiceTotalCost?: number;
  modelCosts: { [modelId: string]: number };
};

export type UserUsage = {
  totalCost: number;
  invoiceTotalCost: number;
  dailyCosts: DailyCost[];
};

export interface UsageResponse {
  status: number;
  message: string;
  user?: UserUsage;
}

export async function userAPICluster(
  userId: string,
  month: Date,
): Promise<UsageResponse> {
  try {
    const monthStart = new Date(
      month.getFullYear(),
      month.getMonth(),
      1,
    ).toISOString();
    const monthEnd = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).toISOString();

    // Fetch direct user activities (excluding organization activities)
    const { data: userActivities, error: userError } = await supabaseAdmin
      .from('swarms_cloud_api_activities')
      .select(
        'invoice_total_cost,total_cost,created_at,model_id,swarms_cloud_models(name)',
      )
      .eq('user_id', userId)
      .is('organization_id', null)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);

    if (userError) {
      console.error('Error fetching user activities:', userError);
      return {
        status: 500,
        message: 'Internal server error',
        user: {
          totalCost: 0,
          invoiceTotalCost: 0,
          dailyCosts: [],
        },
      };
    }

    // Fetch activities for organizations where the user is the owner
    const { data: orgActivities, error: orgError } = await supabaseAdmin
      .from('swarms_cloud_api_activities')
      .select(
        `
          invoice_total_cost,
          total_cost,
          created_at,
          model_id,
          organization_id,
          swarms_cloud_models(name),
          swarms_cloud_organizations!inner(owner_user_id)
        `,
      )
      .not('organization_id', 'is', null)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)
      .eq('swarms_cloud_organizations.owner_user_id', userId);

    if (orgError) {
      console.error('Error fetching organization activities:', orgError);
      return {
        status: 500,
        message: 'Internal server error',
        user: {
          totalCost: 0,
          invoiceTotalCost: 0,
          dailyCosts: [],
        },
      };
    }

    // Combine user and organization activities
    const allActivities = [...userActivities, ...orgActivities];

    const userTotalCost = allActivities.reduce(
      (acc, item) => acc + (item.total_cost || 0),
      0,
    );
    const userInvoiceTotalCost = allActivities.reduce(
      (acc, item) => acc + (item.invoice_total_cost || 0),
      0,
    );

    const userDailyCosts: DailyCost[] = [];

    for (const activity of allActivities) {
      const activityDate = activity.created_at.slice(0, 10);
      const modelName = activity.swarms_cloud_models?.name || '';

      let existingDailyCost = userDailyCosts.find(
        (cost) => cost.date === activityDate,
      );

      if (!existingDailyCost) {
        existingDailyCost = {
          date: activityDate,
          totalCost: 0,
          modelCosts: {},
        };
        userDailyCosts.push(existingDailyCost);
      }

      // Update total costs
      existingDailyCost.totalCost +=
        (activity.total_cost || 0) + (activity.invoice_total_cost || 0);
      // Update model costs
      existingDailyCost.modelCosts[modelName] =
        (existingDailyCost.modelCosts[modelName] || 0) +
        (activity.total_cost || 0) +
        (activity.invoice_total_cost || 0);
    }

    return {
      status: 200,
      message: 'Success',
      user: {
        totalCost: Number(userTotalCost),
        invoiceTotalCost: Number(userInvoiceTotalCost),
        dailyCosts: userDailyCosts,
      },
    };
  } catch (error) {
    console.error('Error calculating total monthly usage:', error);

    return {
      status: 500,
      message: 'Internal server error',
      user: { totalCost: 0, invoiceTotalCost: 0, dailyCosts: [] },
    };
  }
}
