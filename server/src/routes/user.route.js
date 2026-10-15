import express from "express";
import { loginUser, registerUser, updateUser, deleteUser, getUser } from "../controllers/user.controller.js";
const userRouter = express.Router();

// Define your user routes here
userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/:id", getUser);

export default userRouter;