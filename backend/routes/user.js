import express from "express";
import { auth } from "../middleware/auth.js";
import { signup, login, updateUsername, deleteUser, updateEmail} from "../controllers/user.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/user/username/update", auth, updateUsername);
userRouter.put("/user/email/update", auth, updateEmail);
userRouter.delete("/user/:userId", auth, deleteUser);

export default userRouter;
