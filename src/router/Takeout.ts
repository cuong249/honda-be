import { Router } from "express";
import {
  createTakeout,
  deleteTakeout,
  getListTakeout,
  getTakeout,
  updateTakeout,
} from "../controller/Takeout";
import { authenticate } from "../middleware/auth";
import { admin } from "../middleware/checkRole";

export const router = Router();

router.get("/:id", authenticate, getTakeout);
router.get("/", authenticate, getListTakeout);
router.post("/", authenticate, createTakeout);
router.put("/:id", authenticate, updateTakeout);
router.delete("/:id", authenticate, admin, deleteTakeout);
