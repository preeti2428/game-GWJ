import { MongoClient } from "mongodb";
import dns from "dns";

// Windows Node DNS fix for MongoDB SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

// Ek hi connection reuse hota hai (dev me hot-reload par bhi).
let clientPromise = globalThis._mongoClientPromise;

export function hasMongo() {
  return Boolean(process.env.MONGODB_URI || process.env.MONGO_URI);
}

export async function getDb() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI environment variable");

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
    globalThis._mongoClientPromise = clientPromise;
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "jaimandb";
  return client.db(dbName);
}
