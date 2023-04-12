import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((con) => {
      console.log("connected to DB");
    })
    .catch((err) => console.log(err));
};

export default connectDB
