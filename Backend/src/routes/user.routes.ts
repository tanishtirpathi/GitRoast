import { GetCurrentUser, Login, Logout, Signup } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout)
router.get("/me", requireAuth, GetCurrentUser)
export default router;
