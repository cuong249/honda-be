import { Router } from "express";
import {
  createRole,
  deleteRole,
  getListRole,
  getRole,
  updateRole,
} from "../controller/Role";
import { admin } from "../middleware/checkRole";
import { authenticate } from "../middleware/auth";

export const router = Router();

router.get("/:id", authenticate, getRole);
router.get("/", authenticate, admin, getListRole);
router.post("/", authenticate, admin, createRole);
router.put("/:id", authenticate, admin, updateRole);
router.delete("/:id", authenticate, admin, deleteRole);
