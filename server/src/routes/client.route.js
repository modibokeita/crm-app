import express from "express";

import {
  getClient,
  getClientsCount,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";
import upload from "../middleware/upload.middleware.js";
import protect from "../middleware/auth.middleware.js";

const clientRouter = express.Router();

// All client endpoints require authentication.
clientRouter.use(protect);

// Specific routes must come before /:id.
clientRouter.get("/count", getClientsCount);
clientRouter.get("/", getClient);
clientRouter.post("/",upload.single("image"), createClient);
clientRouter.put("/:id",upload.single("image"), updateClient);
clientRouter.get("/:id", getClientById);
clientRouter.delete("/:id", deleteClient);

export default clientRouter;