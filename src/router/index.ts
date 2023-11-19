import express, { Router } from "express";
import { router as AccountRouter } from "./Account";
import { router as categoryRouter } from "./Category";
import { router as deliveryRouter } from "./Delivery";
import { router as machineRouter } from "./Machine";
import { router as productRouter } from "./Product";
import { router as roleRouter } from "./Role";
import { router as takeoutRouter } from "./Takeout";
import { router as warehouseRouter } from "./Warehouse";
import { router as makerRouter } from "./Maker";
import { router as permissionRouter } from "./Permission";
import { router as authRouter } from "./Auth";

export const router = Router();

router.use("/account", AccountRouter);
router.use("/takeout", takeoutRouter);
router.use("/delivery", deliveryRouter);
router.use("/warehouse", warehouseRouter);
router.use("/maker", makerRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/role", roleRouter);
router.use("/machine", machineRouter);
router.use("/permission", permissionRouter);
router.use("/auth", authRouter);
