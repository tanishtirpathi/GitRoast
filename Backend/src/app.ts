import express from "express";
import cookieParser from "cookie-parser";

import healthRouter from "./routes/health.route.js";
import aiRouter from "./routes/ai.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/health", healthRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user",userRouter );

export default app;
