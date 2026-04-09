import {handleChat , startChat} from "../controllers/ai.controller.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js"
 

const aiRouter = Router();

aiRouter.post("/chat",requireAuth, handleChat);
aiRouter.post("/start", requireAuth, startChat);
export default aiRouter;
