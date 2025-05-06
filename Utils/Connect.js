/* eslint-disable no-undef */
import { connect } from "mongoose";

const dbConnection = async () => {
  try {
    return connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export default dbConnection;
