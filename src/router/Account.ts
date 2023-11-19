import { Router } from "express";
import {
  createAccount,
  deleteAccount,
  getAccountInfo,
  getListAccount,
  updateAccount,
} from "../controller/Account";
import { authenticate } from "../middleware/auth";
import { admin, adminOrOwner } from "../middleware/checkRole";

export const router = Router();

router.get("/:id", authenticate, adminOrOwner, getAccountInfo);
router.get("/", authenticate, admin, getListAccount);
router.post("/", authenticate, admin, createAccount);
router.put("/:id", authenticate, adminOrOwner, updateAccount);
router.delete("/:id", authenticate, admin, deleteAccount);
