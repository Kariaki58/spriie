import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const cached = (global as any)._mongoose || { conn: null, promise: null };


async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(uri).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

(global as any)._mongoose = cached;

export default connectToDatabase;