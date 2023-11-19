import { Router } from "express";
import {
  createMachine,
  deleteMachine,
  getListMachine,
  getMachine,
  updateMachine,
} from "../controller/Machine";
import { authenticate } from "../middleware/auth";
import { admin } from "../middleware/checkRole";

export const router = Router();

router.get("/:id", authenticate, getMachine);
router.get("/", authenticate, getListMachine);
router.post("/", authenticate, admin, createMachine);
router.put("/:id", authenticate, admin, updateMachine);
router.delete("/:id", authenticate, admin, deleteMachine);
