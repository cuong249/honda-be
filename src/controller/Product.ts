import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Product } from "../database/models/Product";
import { ROLE, STATE, STATE_MAINTAIN } from "../database/enum/enum";
import { Category } from "../database/models/Category";
import { Warehouse } from "../database/models/Warehouse";
import { Op } from "sequelize";

async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};
    console.log(id);

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
      !reqProduct.qrcode ||
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
      qrcode: reqProduct.qrcode,
      numberCode: reqProduct.numberCode,
      categoryId: reqProduct.categoryId,
      storageWarehouseId: reqProduct.storageWarehouseId,
      deliveryWarehouseId: reqProduct.deliveryWarehouseId,
      currentWarehouseId: reqProduct.currentWarehouseId,
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
      !newProduct.qrcode ||
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
      qrcode: newProduct.qrcode,
      numberCode: newProduct.numberCode,
      categoryId: newProduct.categoryId,
      storageWarehouseId: newProduct.storageWarehouseId,
      deliveryWarehouseId: newProduct.deliveryWarehouseId,
      currentWarehouseId: newProduct.currentWarehouseId,
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

export {
  getProduct,
  getListProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
