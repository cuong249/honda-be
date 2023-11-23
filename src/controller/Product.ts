import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Product } from "../database/models/Product";
import {
  ROLE,
  STATE,
  STATE_MAINTAIN,
  STATE_MAINTENANCE,
} from "../database/enum/enum";
import { Category } from "../database/models/Category";
import { Warehouse } from "../database/models/Warehouse";
import { DATE, Op } from "sequelize";
import { Maintenance } from "../database/models/Maintenance";

async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    let product: Product | null = new Product();
    product = await Product.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          queryObj,
        ],
      },
    });
    if (!product) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    const category: Category | null = await Category.findOne({
      where: {
        [Op.and]: [
          {
            id: product.categoryId,
          },
          {
            state: STATE.ACTIVE,
          },
        ],
      },
    });
    if (category) {
      product.setDataValue("category", category);
    }
    const storageWarehouse: Warehouse | null = await Warehouse.findOne({
      where: {
        [Op.and]: [
          {
            id: product.storageWarehouseId,
          },
          {
            state: STATE.ACTIVE,
          },
        ],
      },
    });
    if (storageWarehouse) {
      product.setDataValue("storageWarehouse", storageWarehouse);
    }
    const deliveryWarehouse: Warehouse | null = await Warehouse.findOne({
      where: {
        [Op.and]: [
          {
            id: product.deliveryWarehouseId,
          },
          {
            state: STATE.ACTIVE,
          },
        ],
      },
    });
    if (deliveryWarehouse) {
      product.setDataValue("deliveryWarehouse", deliveryWarehouse);
    }
    const currentWarehouse: Warehouse | null = await Warehouse.findOne({
      where: {
        [Op.and]: [
          {
            id: product.currentWarehouseId,
          },
          {
            state: STATE.ACTIVE,
          },
        ],
      },
    });
    if (currentWarehouse) {
      product.setDataValue("currentWarehouse", currentWarehouse);
    }
    const listMaintenance = await Maintenance.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        productId: product.id,
      },
    });
    if (listMaintenance.length) {
      const maintenance = listMaintenance[0];
      product.setDataValue("maintenance", maintenance);
    }
    res.status(200).json({ product });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find product",
      error: <Error>err.message,
    });
  }
}

async function getListProduct(req: Request, res: Response) {
  try {
    const { limit, offset, order, search, arrange, query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    const orderConditions: [string, string][] = [];

    if (order !== undefined && arrange !== undefined) {
      orderConditions.push([order as string, arrange as string]);
    } else {
      orderConditions.push(["createdAt", "DESC"]);
    }

    const { count, rows } = await Product.findAndCountAll({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderConditions,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                name: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
              {
                numberCode: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
            ],
          },
          queryObj,
        ],
      },
    });

    const listProduct = rows;

    for (const product of listProduct) {
      const category: Category | null = await Category.findOne({
        where: {
          [Op.and]: [
            {
              id: product.categoryId,
            },
            {
              state: STATE.ACTIVE,
            },
          ],
        },
      });
      if (category) {
        product.setDataValue("category", category);
      }
      const storageWarehouse: Warehouse | null = await Warehouse.findOne({
        where: {
          [Op.and]: [
            {
              id: product.storageWarehouseId,
            },
            {
              state: STATE.ACTIVE,
            },
          ],
        },
      });
      if (storageWarehouse) {
        product.setDataValue("storageWarehouse", storageWarehouse);
      }
      const deliveryWarehouse: Warehouse | null = await Warehouse.findOne({
        where: {
          [Op.and]: [
            {
              id: product.deliveryWarehouseId,
            },
            {
              state: STATE.ACTIVE,
            },
          ],
        },
      });
      if (deliveryWarehouse) {
        product.setDataValue("deliveryWarehouse", deliveryWarehouse);
      }
      const currentWarehouse: Warehouse | null = await Warehouse.findOne({
        where: {
          [Op.and]: [
            {
              id: product.currentWarehouseId,
            },
            {
              state: STATE.ACTIVE,
            },
          ],
        },
      });
      if (currentWarehouse) {
        product.setDataValue("currentWarehouse", currentWarehouse);
      }
      const listMaintenance = await Maintenance.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          productId: product.id,
        },
      });
      if (listMaintenance.length) {
        const maintenance = listMaintenance[0];
        product.setDataValue("maintenance", maintenance);
      }
    }
    res.status(200).json({ amount: count, products: listProduct });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find product",
      error: <Error>err.message,
    });
  }
}

async function createProduct(req: Request, res: Response) {
  try {
    const reqProduct: Product = req.body;
    if (
      !reqProduct.name ||
      !reqProduct.rfid ||
      !reqProduct.numberCode ||
      !reqProduct.storageWarehouseId ||
      !reqProduct.deliveryWarehouseId ||
      !reqProduct.currentWarehouseId ||
      !reqProduct.categoryId ||
      !reqProduct.state
    ) {
      res.status(422);
      throw new Error("Missing data body");
    }
    if (reqProduct.state == STATE_MAINTAIN.MAINTAIN) {
      res.status(404);
      throw new Error("Could not create product with state is maintain");
    }

    const category: Category | null = await Category.findOne({
      where: { id: reqProduct.categoryId, state: STATE.ACTIVE },
    });
    if (!category) {
      res.status(422);
      throw new Error("Category id does not exist");
    }
    const storageWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: reqProduct.storageWarehouseId, state: STATE.ACTIVE },
    });
    if (!storageWarehouse) {
      res.status(422);
      throw new Error("Storage warehouse id does not exist");
    }
    const deliveryWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: reqProduct.deliveryWarehouseId, state: STATE.ACTIVE },
    });
    if (!deliveryWarehouse) {
      res.status(422);
      throw new Error("Delivery warehouse id does not exist");
    }
    const currentWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: reqProduct.currentWarehouseId, state: STATE.ACTIVE },
    });
    if (!currentWarehouse) {
      res.status(422);
      throw new Error("Current warehouse id does not exist");
    }
    const product: Product = await Product.create({
      id: uuid(),
      name: reqProduct.name,
      rfid: reqProduct.rfid,
      numberCode: reqProduct.numberCode,
      categoryId: reqProduct.categoryId,
      storageWarehouseId: reqProduct.storageWarehouseId,
      deliveryWarehouseId: reqProduct.deliveryWarehouseId,
      currentWarehouseId: reqProduct.currentWarehouseId,
      maintainNext: reqProduct.maintainNext,
      state: reqProduct.state,
      option: reqProduct.option,
    });
    if (product) {
      res.status(200).json({ product });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create product",
      error: <Error>err.message,
    });
  }
}

async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newProduct: Product = req.body;
    const product: Product | null = await Product.findOne({
      where: { id: id },
    });
    if (!product) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (
      !newProduct.name ||
      !newProduct.rfid ||
      !newProduct.numberCode ||
      !newProduct.storageWarehouseId ||
      !newProduct.deliveryWarehouseId ||
      !newProduct.currentWarehouseId ||
      !newProduct.categoryId ||
      !newProduct.state
    ) {
      res.status(422);
      throw new Error("Missing data body");
    }
    if (newProduct.state == STATE_MAINTAIN.MAINTAIN) {
      res.status(404);
      throw new Error("Cannot update state to maintain");
    }
    const category: Category | null = await Category.findOne({
      where: { id: newProduct.categoryId, state: STATE.ACTIVE },
    });
    if (!category) {
      res.status(422);
      throw new Error("Category id does not exist");
    }
    const storageWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: newProduct.storageWarehouseId, state: STATE.ACTIVE },
    });
    if (!storageWarehouse) {
      res.status(422);
      throw new Error("Storage warehouse id does not exist");
    }
    const deliveryWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: newProduct.deliveryWarehouseId, state: STATE.ACTIVE },
    });
    if (!deliveryWarehouse) {
      res.status(422);
      throw new Error("Delivery warehouse id does not exist");
    }
    const currentWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: newProduct.currentWarehouseId, state: STATE.ACTIVE },
    });
    if (!currentWarehouse) {
      res.status(422);
      throw new Error("Current warehouse id does not exist");
    }
    product.set({
      name: newProduct.name,
      rfid: newProduct.rfid,
      numberCode: newProduct.numberCode,
      categoryId: newProduct.categoryId,
      storageWarehouseId: newProduct.storageWarehouseId,
      deliveryWarehouseId: newProduct.deliveryWarehouseId,
      currentWarehouseId: newProduct.currentWarehouseId,
      maintainNext: newProduct.maintainNext,
      state: newProduct.state,
      option: newProduct.option,
    });
    await product.save();
    res.status(200).json({ product });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update product",
      error: <Error>err.message,
    });
  }
}

async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product: Product | null = await Product.findOne({
      where: { id: id },
    });
    if (!product) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    product.set({
      state: STATE_MAINTAIN.DELETED,
    });
    await product.save();
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete product",
      error: <Error>err.message,
    });
  }
}

async function maintainProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const product: Product | null = await Product.findOne({
      where: {
        id: id,
        state: [STATE_MAINTAIN.ACTIVE, STATE_MAINTAIN.MAINTAIN],
      },
    });
    if (!product) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    if (product.state == STATE_MAINTAIN.MAINTAIN) {
      res.status(404);
      throw new Error("Product state is maintenance");
    }
    const maintenance = await Maintenance.create({
      id: uuid(),
      productId: product.id,
      startDate: new Date().getTime(),
      finishDate: null,
      description: description,
      state: STATE_MAINTENANCE.DOING,
      option: null,
    });
    product.set({
      state: STATE_MAINTAIN.MAINTAIN,
    });
    product.save();
    if (maintenance) {
      res.status(200).json({ message: "Maintain product successfully" });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not maintain product",
      error: <Error>err.message,
    });
  }
}

async function completeMaintainProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nextDate } = req.body;
    if (!nextDate) {
      res.status(422);
      throw new Error("Missing data body");
    }
    if ((nextDate as number) <= 0) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const product: Product | null = await Product.findOne({
      where: {
        id: id,
        state: [STATE_MAINTAIN.ACTIVE, STATE_MAINTAIN.MAINTAIN],
      },
    });
    if (!product) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    if (product.state !== STATE_MAINTAIN.MAINTAIN) {
      res.status(404);
      throw new Error("Product state is not maintained");
    }
    const listMaintenance = await Maintenance.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        productId: product.id,
        state: STATE_MAINTENANCE.DOING,
      },
    });
    if (!listMaintenance.length) {
      res.status(404);
      throw new Error("The product has never been maintained");
    }

    const maintenance = listMaintenance[0];
    maintenance.set({
      finishDate: new Date().getTime(),
      nextDate: new Date().getTime() + nextDate,
      state: STATE_MAINTENANCE.COMPLETED,
    });
    maintenance.save();
    product.set({
      state: STATE_MAINTAIN.ACTIVE,
      maintainNext: new Date().getTime() + nextDate,
    });
    product.save();
    if (maintenance) {
      res
        .status(200)
        .json({ message: "Complete maintain product successfully" });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not maintain product",
      error: <Error>err.message,
    });
  }
}

export {
  getProduct,
  getListProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  maintainProduct,
  completeMaintainProduct,
};
