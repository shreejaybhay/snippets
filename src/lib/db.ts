import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose;
  }

  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URL!, {
      dbName: "snippets",
      // Add connection pooling options
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    if (connection.readyState === 1) {
      isConnected = true;
      console.log(`MongoDB connected: ${connection.host}`);
      return mongoose;
    }

    throw new Error("MongoDB connection failed");
  } catch (error) {
    isConnected = false;
    if (error instanceof Error) {
      console.error("MongoDB connection error:", error.message);
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
    throw new Error("An unknown error occurred while connecting to MongoDB");
  }
};

// Add a cleanup function for graceful shutdown
export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    process.exit(1);
  }
};

