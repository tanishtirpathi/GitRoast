import {handleChat} from "../controllers/ai.controller.js";
import { Router } from "express";

const aiRouter = Router();

aiRouter.post("/chat", handleChat);
export default aiRouter;
