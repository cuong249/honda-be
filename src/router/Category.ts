import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getListCategory,
  getListCategoryWithChild,
  getCategory,
  updateCategory,
} from "../controller/Category";
import { authenticate } from "../middleware/auth";
import { admin } from "../middleware/checkRole";

export const router = Router();

router.get("/child", authenticate, getListCategoryWithChild);
router.get("/:id", authenticate, getCategory);
router.get("/", authenticate, getListCategory);
router.post("/", authenticate, admin, createCategory);
router.put("/:id", authenticate, admin, updateCategory);
router.delete("/:id", authenticate, admin, deleteCategory);
