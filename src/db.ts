import { MongoClient, Db } from "mongodb";

/**
 * Drift — MongoDB connection helper (drift-server side).
 *
 * Uses a NON-SRV connection string, same reasoning as drift-client's
 * original version. Cached at module scope so repeated Vercel serverless
 * invocations reuse the same connection instead of opening a new one
 * every cold start.
 */

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "drift";

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI in .env — use the non-SRV connection string from Atlas."
  );
}

let cachedClientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (cachedClientPromise) {
    return cachedClientPromise;
  }

  const client = new MongoClient(MONGODB_URI as string);
  cachedClientPromise = client.connect();

  return cachedClientPromise;
}

/**
 * Get a handle to the Drift database. Call inside route handlers —
 * never at module top-level outside this file.
 *
 *   const db = await getDb();
 *   const cars = await db.collection("cars").find().toArray();
 */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(MONGODB_DB);
}

export default getClientPromise;