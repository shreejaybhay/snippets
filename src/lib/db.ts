import mongoose from "mongoose";

let isConnected = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache the connection promise to prevent multiple concurrent connection attempts
let connectionPromise: Promise<typeof mongoose> | null = null;

// Set max listeners before any connection attempts
mongoose.connection.setMaxListeners(15);

export const connectDB = async (retryCount = 0): Promise<typeof mongoose> => {
  // If already connected, return existing connection immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If a connection attempt is in progress, return the existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create new connection promise
  connectionPromise = (async () => {
    try {
      const { connection } = await mongoose.connect(process.env.MONGODB_URL!, {
        dbName: "snippets",
        maxPoolSize: 10,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        retryWrites: true,
        w: "majority",
        connectTimeoutMS: 10000,
      });

      if (connection.readyState === 1) {
        isConnected = true;
        return mongoose;
      }

      throw new Error("MongoDB connection failed");
    } catch (error) {
      isConnected = false;
      connectionPromise = null;
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Connection attempt ${retryCount + 1} failed. Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return connectDB(retryCount + 1);
      }

      if (error instanceof Error) {
        console.error("MongoDB connection error:", error.message);
        throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      throw new Error(`An unknown error occurred while connecting to MongoDB after ${MAX_RETRIES} attempts`);
    }
  })();

  try {
    const result = await connectionPromise;
    connectionPromise = null;
    return result;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

// Remove any existing listeners and set up new ones only once
mongoose.connection.removeAllListeners();

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  connectionPromise = null;
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  connectionPromise = null;
  console.error('MongoDB connection error:', err);
});

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    process.exit(1);
  }
};

export const checkConnection = async (): Promise<boolean> => {
  return mongoose.connection.readyState === 1;
}; // Added missing closing brace

// Add these indexes to your Snippet schema
const snippetSchema = new mongoose.Schema({
  // ... other fields ...
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  comments: [{
    // ... comment fields ...
    createdAt: { type: Date, index: true }
  }]
});

// Add compound indexes for better query performance
snippetSchema.index({ userId: 1, createdAt: -1 });
snippetSchema.index({ "comments.userId": 1, "comments.createdAt": -1 });
