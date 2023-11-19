import { Router } from "express";
import {
  createWarehouse,
  deleteWarehouse,
  getListWarehouse,
  getWarehouse,
  updateWarehouse,
} from "../controller/Warehouse";
import { authenticate } from "../middleware/auth";
import { admin } from "../middleware/checkRole";

export const router = Router();
router.get("/:id", authenticate, getWarehouse);
router.get("/", authenticate, getListWarehouse);
router.post("/", authenticate, admin, createWarehouse);
router.put("/:id", authenticate, admin, updateWarehouse);
router.delete("/:id", authenticate, admin, deleteWarehouse);
