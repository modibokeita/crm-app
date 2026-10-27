
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
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
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRouter);
app.use("/api/clients", clientRouter);
app.use("/api/rdv", rdvRouter);

export default app;