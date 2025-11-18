import mongoose, { ConnectOptions, Mongoose } from "mongoose";

/**
 * Shape of the cached connection object stored on the global scope.
 * This avoids creating multiple connections during development hot reloads.
 */
interface MongooseGlobal {
  mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

/**
 * Extend the Node.js global type to include our cached Mongoose connection.
 *
 * We cast `globalThis` to this interface when accessing the cache
 * so TypeScript understands that `global.mongoose` exists.
 */
declare const global: typeof globalThis & MongooseGlobal;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside your .env.local file"
  );
}

/**
 * Cached connection state, stored in the global scope in development.
 *
 * - `conn`: The active Mongoose connection instance, if one exists.
 * - `promise`: A pending connection promise to avoid starting multiple
 *   connections at the same time.
 */
const cached: MongooseGlobal["mongoose"] =
  (global.mongoose as MongooseGlobal["mongoose"]) || {
    conn: null,
    promise: null,
  };

// Ensure the cache is stored on the global object (important for dev/hot-reload)
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose.
 *
 * This function:
 * - Reuses an existing connection if available
 * - Caches the connection promise to prevent duplicate connections
 * - Is safe to call from API routes, server components, and route handlers
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If a connection already exists, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, reuse the promise
  if (!cached.promise) {
    const options: ConnectOptions = {
      // Add any Mongoose options you need here
      // Example: dbName: "my_database",
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, options);
  }

  // Wait for the connection, then cache and return it
  cached.conn = await cached.promise;
  return cached.conn;
}
