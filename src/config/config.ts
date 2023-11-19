import { Router } from "express";
import { router } from "../router";
import bodyParser from "body-parser";
import cors from "cors";
import { Account } from "../database/models/Account";
import { Category } from "../database/models/Category";
import { Delivery } from "../database/models/Delivery";
import { Machine } from "../database/models/Machine";
import { Permission } from "../database/models/Permission";
import { Product } from "../database/models/Product";
import { Role } from "../database/models/Role";
import { RolePermission } from "../database/models/RolePermission";
import { Scan } from "../database/models/Scan";
import { Transfer } from "../database/models/Transfer";
import { TransferDetail } from "../database/models/TransferDetail";
import { Warehouse } from "../database/models/Warehouse";
import { createPermission } from "./Permission";
import cookieParser from "cookie-parser";

const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  exposedHeaders: "Authorization",
  credentials: true,
};

export async function config(app: Router) {
  await createDatabase();
  // await initDatabase();
  await app.use(cors(corsOptions));
  await app.use(bodyParser.json());
  await app.use(cookieParser());
  await app.use("/api", router);
}

async function createDatabase() {
  await Account.sync({ alter: true });
  await Category.sync({ alter: true });
  await Delivery.sync({ alter: true });
  await Machine.sync({ alter: true });
  await Permission.sync({ alter: true });
  await Product.sync({ alter: true });
  await Role.sync({ alter: true });
  await RolePermission.sync({ alter: true });
  await Scan.sync({ alter: true });
  await Transfer.sync({ alter: true });
  await TransferDetail.sync({ alter: true });
  await Warehouse.sync({ alter: true });
}

async function initDatabase() {
  await createPermission();
}
