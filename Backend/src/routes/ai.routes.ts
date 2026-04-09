import {handleChat} from "../controllers/ai.controller.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js"
 

const aiRouter = Router();

aiRouter.post("/chat",requireAuth, handleChat);
export default aiRouter;
