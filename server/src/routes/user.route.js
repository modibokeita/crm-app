import express from "express";

import {
  loginUser,
  registerUser,
  updateUser,
  deleteUser,
  getUser,
} from "../controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);

// Authenticated routes
userRouter.put("/:id", protect, updateUser);
userRouter.delete("/:id", protect, deleteUser);
userRouter.get("/:id", protect, getUser);

export default userRouter;