import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
const cached: MongooseCache = global.mongoose || (global.mongoose = { conn: null, promise: null });
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
export default dbConnect;
