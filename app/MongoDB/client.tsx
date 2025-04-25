// app/MongoDB/client.ts
import { MongoClient, Db, ServerApiVersion } from "mongodb";

// Define MongoDB connection URI - set this in your environment variables
const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/vapi-interviewer";

// Configure MongoDB client
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

// Maintain a cached connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Function to connect to the database (or return cached connection)
async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    // If we already have a connection, use it
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    // Check for MongoDB URI
    if (!process.env.MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable");
    }

    // No cached connection, create a new one
    const client = new MongoClient(uri, options);

    try {
        await client.connect();
        const db = client.db();

        // Cache the connection
        cachedClient = client;
        cachedDb = db;

        return { client, db };
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

// Export the database object directly
const db: Promise<Db> = connectToDatabase().then(({ db }) => db);

// Helper function to get a collection
export function collection(name: string) {
    return db.then((database) => database.collection(name));
}

export { db };
