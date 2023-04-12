import express from "express";
import { auth } from "../middleware/auth.js";
import {
  addList,
  deleteList,
  updateListTitle,
  updateListColor,
} from "../controllers/lists.js";

const listsRouter = express.Router();

listsRouter.patch("/add", auth, addList);
listsRouter.patch("/update/:title/:listId", auth, updateListTitle);
listsRouter.post("/update/color/:listId", auth, updateListColor);
listsRouter.delete("/remove/:id", auth, deleteList);

export default listsRouter;
