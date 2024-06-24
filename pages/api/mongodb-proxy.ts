import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { runMiddleware } from '@/shared/utils/mongodb/middleware';
import { connectToDb } from '@/shared/utils/mongodb/mongo';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST'],
});

export const config = {
  api: {
    bodyParser: true, // Enable body parsing
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    // Connect to MongoDB and insert data
    const db = await connectToDb();
    const collection = db.collection('swarms-agent');

    const data = req.body;

    if (data) {
      await collection.insertOne(data);
      res.status(201).json({ message: 'Data inserted successfully!' });
    } else {
      res.status(400).json({ message: 'No data found' });
    }
  } catch (error) {
    console.error('Error inserting data:', error);

    if (
      error instanceof SyntaxError &&
      error.message.includes('Unexpected token')
    ) {
      res.status(400).json({ message: 'Invalid JSON input' });
    } else {
      res.status(500).json({ message: 'Error processing request' });
    }
  }
};

export default handler;
