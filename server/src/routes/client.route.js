import express from "express";

import {
  createClient,
  getClient,
  updateClient,
  deleteClient,
  getClientById,
  getClientsCount
} from "../controllers/client.controller.js";

const clientRouter = express.Router();

clientRouter.post("/newClient", createClient);
clientRouter.get("/", getClient);
clientRouter.get("/count", getClientsCount);
clientRouter.get("/:id", getClientById);
clientRouter.put("/:id", updateClient);
clientRouter.delete("/:id", deleteClient);


export default clientRouter;