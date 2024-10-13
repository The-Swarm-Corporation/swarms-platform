import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const updateTwentyCrmUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const input = req.body;
    const { user_id, job, company, referral } = input;

    if (!user_id) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, twenty_crm_id')
      .eq('id', user_id)
      .single();
    if (error) throw error;

    if (!data.twenty_crm_id) {
      return res.status(404).json({
        error: 'Twenty crm not found',
      });
    }

    const response = await axios.patch(
      `${process.env.TWENTY_CRM_API_URL}/swarms/${data.twenty_crm_id}`,
      { job, company, referral },
      {
        headers: {
          Authorization: `Bearer ${process.env.TWENTY_CRM_TOKEN}`,
        },
      },
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('An error occurred while updating:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default updateTwentyCrmUser;
