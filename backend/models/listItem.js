import mongoose from "mongoose";

export const listItemSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);
