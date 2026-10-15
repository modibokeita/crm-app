
import "dotenv/config";
import express from "express";
import cors from "cors";

import userRouter from "./routes/user.route.js";
import clientRouter from "./routes/client.route.js";
import rdvRouter from "./routes/rdv.route.js";
const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/clients", clientRouter);
app.use("/api/rdv", rdvRouter);

export default app;