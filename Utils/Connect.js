import { connect } from "mongoose";

const dbConnection = async () => {
  try {
    return connect("mongodb://localhost:27017/users");
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export default dbConnection;
