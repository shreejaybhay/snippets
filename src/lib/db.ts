import mongoose from "mongoose";

interface ConnectionOptions {
  dbName: string;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URL!, {
      dbName: "snippets",
    });

    if (connection.readyState === 1) {
      console.log(`MongoDB connected: ${connection.host}`);
      return mongoose;
    }

    throw new Error("MongoDB connection failed");
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB connection error:", error.message);
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
    throw new Error("An unknown error occurred while connecting to MongoDB");
  }
};

