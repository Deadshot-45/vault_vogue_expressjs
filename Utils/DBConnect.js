// dbConnect.js
import { connect } from "mongoose";
import dotenv from "dotenv"; // Importing dotenv to load environment variables
dotenv.config();

const dbConnect = async () => {
  try {
    // eslint-disable-next-line no-undef
    await connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default dbConnect;