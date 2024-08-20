import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define a schema using Zod for validation
const TelemetryDataSchema = z.object({
    data: z.any().optional(),
    swarms_api_key: z.string().optional(),
});

/**
 * Handler function to process incoming telemetry data and store it in Supabase.
 * 
 * @param req - The incoming Next.js API request object.
 * @param res - The outgoing Next.js API response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    console.log('Received a request to /api/telemetry');

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        console.warn('Received a non-POST request method');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Validate the incoming data using Zod
        const telemetryData = TelemetryDataSchema.safeParse(req.body);

        if (!telemetryData.success) {
            console.error('Validation failed for incoming data', telemetryData.error.errors);
            return res.status(400).json({ error: 'Invalid data format', details: telemetryData.error.errors });
        }

        const { data, swarms_api_key } = telemetryData.data;

        const sourceIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('Source IP:', sourceIp);

        // Function to attempt data insertion with retries
        const insertTelemetryData = async (retryCount = 3): Promise<void> => {
            try {
                const { error } = await supabaseAdmin
                    .from('swarms_framework_schema')
                    .insert([
                        {
                            data: data || null,
                            swarms_api_key: swarms_api_key || null,
                            source_ip: sourceIp || null,
                        },
                    ]);

                if (error) {
                    throw new Error(`Supabase insert error: ${error.message}`);
                }

                console.log('Telemetry data successfully stored in Supabase');
            } catch (error) {
                console.error('Failed to insert data into Supabase', error);

                if (retryCount > 0) {
                    console.warn(`Retrying data insertion, attempts remaining: ${retryCount}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));  // Wait before retrying
                    return insertTelemetryData(retryCount - 1);
                } else {
                    throw error;  // Rethrow the error after all retries have failed
                }
            }
        };

        // Attempt to insert telemetry data
        await insertTelemetryData();

        // Respond with success
        return res.status(200).json({ message: 'Telemetry data received and stored successfully' });

    } catch (error: any) {
        console.error('Telemetry API error', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
