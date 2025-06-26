import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

const TelemetryDataSchema = z.object({
  data: z.any(), // We only validate the data field as required
});

const logAgent = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.authenticate();

    if (!authResult.isAuthenticated || !authResult.userId) {
      return res.status(authResult.status).json({
        error: 'Authentication required to log agent usage',
        message: authResult.message,
        hint: 'Provide API key in Authorization header or authenticate via Supabase',
        auth_methods: ['API Key (Bearer token)', 'Supabase session']
      });
    }

    const user_id = authResult.userId;

    const telemetryData = TelemetryDataSchema.parse(req.body);

    const { data } = telemetryData;

    // Get source IP (using modern approach)
    const sourceIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      null;

    const apiKey = req.headers.authorization?.split(' ')[1] || null;

    const { error } = await supabaseAdmin
      .from('swarms_framework_schema')
      .insert([
        {
          data: data || null,
          swarms_api_key: apiKey,
        },
      ]);

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    return res.status(200).json({
      message: 'Telemetry data received and stored successfully',
      data,
    });
  } catch (error: any) {
    console.error('Telemetry API error', error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
};

export default logAgent;
