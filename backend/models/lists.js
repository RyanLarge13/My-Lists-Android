import { listItemSchema } from "./listItem.js";
import mongoose from "mongoose";

export const listsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  color: {
  	type: String
  }, 
  listItems: [listItemSchema],
});
