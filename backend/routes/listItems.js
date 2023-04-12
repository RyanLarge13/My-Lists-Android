import express from "express";
import { auth } from "../middleware/auth.js";
import {
  addItem,
  updateComplete,
  deleteItem,
  updateBody
} from "../controllers/listItems.js";

const listItemsRouter = express.Router();

listItemsRouter.post("/add", auth, addItem);
listItemsRouter.patch("/update/complete", auth, updateComplete);
listItemsRouter.patch("/new/body", auth, updateBody);
listItemsRouter.delete("/remove/:listId/:itemId", auth, deleteItem);

export default listItemsRouter;
