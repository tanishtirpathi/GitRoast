import cors from "cors";
import express from "express";

import healthRouter from "./routes/health.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/health", healthRouter);

export default app;
