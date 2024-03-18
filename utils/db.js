// Connect ke mongodb local menggunakan package mongoose
import mongoose from "mongoose";

// const connectDb = mongoose
//   .connect("mongodb://127.0.0.1:27017/contacts-app") // connect menggunakan Mongodb local(mongoshell)

export const connectDb = () => {
  try {
    mongoose.connect(process.env.MONGODB_CONNECT_URL);
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error("COULD NOT CONNECT TO DATABASE:", error.message);
  }
};
