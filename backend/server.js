import express from "express";
import dotenv from "dotenv";
import parser from "body-parser";
import cors from "cors";
dotenv.config();

import connectDB from "./config/mongodb.js";
import { auth } from "./middleware/auth.js";
import userRouter from "./routes/user.js";
import listsRouter from "./routes/lists.js";
import listItemsRouter from "./routes/listItems.js";

import { User } from "./models/user.js";

connectDB();

const app = express();

app.use(cors());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use("/", userRouter);
app.use("/lists", listsRouter);
app.use("/listitem", listItemsRouter);

app.get("/update", auth, (req, res) => {
  const id = req.headers.authorization;
  User.findOne({ _id: id })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "No user found, please sign up" });
      }
      if (user) {
        return res.status(201).json({
          message: "Successfully Synced",
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            lists: user.lists,
          },
        });
      }
    })
    .catch((err) => {
      return res.status(401).json({ message: "error updating user" });
    });
});

app.post("/update", auth, (req, res) => {
  const id = req.headers.authorization;
  const { newLists } = req.body;
  User.findOneAndUpdate({ _id: id }, { $set: { lists: newLists } })
    .then((update, err) => {
      if (err || !update) {
        console.log(err, update);
        return res
          .status(401)
          .json({ message: "Something went wrong with syncing to the server" });
      }
      if (update) {
        return res.status(201).json({ message: "Successfully synced" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(401)
        .json({ message: "Something went wrong with syncing to the server" });
    });
});

app.listen(8080, "0.0.0.0", () => {
  console.log("server running");
});
