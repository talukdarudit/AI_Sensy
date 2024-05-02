import dotenv from "dotenv";
import mongoose from "mongoose";
const DB_NAME = "contacts";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error", error);
    process.exit(1);
  }
};

export default connectDB;
