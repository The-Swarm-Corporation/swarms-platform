import { MongoClient, Db, ConnectOptions } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let client: MongoClient;
let db: Db;

export const connectToDb = async (): Promise<Db> => {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    await client.connect();
    db = client.db();
  }
  return db;
};
