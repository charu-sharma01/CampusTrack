
import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not defined in .env file. Running without database persistence.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.log("Server will continue to run, but database operations will fail.");
    // Do not exit the process, so the server can still respond with errors to the frontend
  }
};

export default connectDB;
