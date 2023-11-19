import { Router } from "express";
import { auth, login, logout } from "../controller/Auth";
import { authenticate } from "../middleware/auth";

export const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, auth);
