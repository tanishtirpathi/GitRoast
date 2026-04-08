import {Login, Signup} from "../controllers/user.controller.js";
import { Router } from "express";

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
export default router;
