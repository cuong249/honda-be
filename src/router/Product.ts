import { Router } from "express";
import {
  completeMaintainProduct,
  createProduct,
  deleteProduct,
  getListProduct,
  getProduct,
  maintainProduct,
  updateProduct,
} from "../controller/Product";
import { authenticate } from "../middleware/auth";
import { adminOrWarehouse } from "../middleware/checkRole";

export const router = Router();

router.post("/maintain/complete/:id", authenticate, completeMaintainProduct);
router.post("/maintain/:id", authenticate, maintainProduct);
router.get("/:id", authenticate, getProduct);
router.get("/", authenticate, getListProduct);
router.post("/", authenticate, adminOrWarehouse, createProduct);
router.put("/:id", authenticate, adminOrWarehouse, updateProduct);
router.delete("/:id", authenticate, adminOrWarehouse, deleteProduct);
