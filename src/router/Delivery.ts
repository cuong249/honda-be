import { Router } from "express";
import {
  createDelivery,
  deleteDelivery,
  getListDelivery,
  getDelivery,
  updateDelivery,
} from "../controller/Delivery";
import { authenticate } from "../middleware/auth";
import { admin } from "../middleware/checkRole";

export const router = Router();

router.get("/:id", authenticate, getDelivery);
router.get("/", authenticate, getListDelivery);
router.post("/", authenticate, createDelivery);
router.put("/:id", authenticate, updateDelivery);
router.delete("/:id", authenticate, admin, deleteDelivery);
