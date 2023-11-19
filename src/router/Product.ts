import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getListProduct,
  getProduct,
  updateProduct,
} from "../controller/Product";
import { authenticate } from "../middleware/auth";
import { adminOrWarehouse } from "../middleware/checkRole";

export const router = Router();

router.get("/:id", authenticate, getProduct);
router.get("/", authenticate, getListProduct);
router.post("/", authenticate, adminOrWarehouse, createProduct);
router.put("/:id", authenticate, adminOrWarehouse, updateProduct);
router.delete("/:id", authenticate, adminOrWarehouse, deleteProduct);
