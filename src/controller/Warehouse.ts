import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Warehouse } from "../database/models/Warehouse";
import { ROLE, STATE, TYPE_WAREHOUSE } from "../database/enum/enum";
import { Op } from "sequelize";
import { log } from "console";

async function getWarehouse(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role } = res.locals.role;
    const [space, api, url] = req.originalUrl.split("/");
    const type =
      url === "warehouse" ? TYPE_WAREHOUSE.HONDA : TYPE_WAREHOUSE.MAKER;
    const { query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};
    let warehouse: Warehouse | null = new Warehouse();
    warehouse = await Warehouse.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          {
            type: type,
          },
          queryObj,
        ],
      },
    });
    if (!warehouse) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    if (type == TYPE_WAREHOUSE.MAKER) {
      const maker = warehouse;
      res.status(200).json({ maker });
    } else {
      res.status(200).json({ warehouse });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find warehouse",
      error: <Error>err.message,
    });
  }
}

async function getListWarehouse(req: Request, res: Response) {
  try {
    const role = res.locals.role;
    const { limit, offset, order, search, arrange, query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    const [space, api, urlAndQuery] = req.originalUrl.split("/");
    const [url] = urlAndQuery.split("?");

    const type =
      url === "warehouse" ? TYPE_WAREHOUSE.HONDA : TYPE_WAREHOUSE.MAKER;

    const orderConditions: [string, string][] = [];

    if (order !== undefined && arrange !== undefined) {
      orderConditions.push([order as string, arrange as string]);
    } else {
      orderConditions.push(["createdAt", "DESC"]);
    }

    const { count, rows } = await Warehouse.findAndCountAll({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderConditions,
      where: {
        [Op.and]: [
          {
            type: type,
          },
          {
            [Op.or]: [
              {
                name: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
              {
                address: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
            ],
          },
          queryObj,
        ],
      },
    });

    const listWarehouse = rows;

    if (type == TYPE_WAREHOUSE.MAKER) {
      res.status(200).json({
        amount: count,
        makers: listWarehouse,
      });
    } else {
      res.status(200).json({
        amount: count,
        warehouses: listWarehouse,
      });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find warehouse",
      error: <Error>err.message,
    });
  }
}

async function createWarehouse(req: Request, res: Response) {
  try {
    const reqWarehouse: Warehouse = req.body;
    const [space, api, urlAndQuery] = req.originalUrl.split("/");
    const [url] = urlAndQuery.split("?");

    const type =
      url === "warehouse" ? TYPE_WAREHOUSE.HONDA : TYPE_WAREHOUSE.MAKER;
    if (!reqWarehouse.name || !reqWarehouse.address || !reqWarehouse.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const warehouse: Warehouse = await Warehouse.create({
      id: uuid(),
      name: reqWarehouse.name,
      address: reqWarehouse.address,
      type: type,
      description: reqWarehouse.description,
      state: reqWarehouse.state,
      option: reqWarehouse.option,
    });
    if (type == TYPE_WAREHOUSE.MAKER) {
      const maker = warehouse;
      res.status(200).json({ maker });
    } else {
      res.status(200).json({ warehouse });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create warehouse",
      error: <Error>err.message,
    });
  }
}

async function updateWarehouse(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newWarehouse: Warehouse = req.body;
    const [space, api, url] = req.originalUrl.split("/");
    const type =
      url === "warehouse" ? TYPE_WAREHOUSE.HONDA : TYPE_WAREHOUSE.MAKER;
    const warehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: id },
    });
    if (!warehouse) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (!newWarehouse.name || !newWarehouse.address || !newWarehouse.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    warehouse.set({
      name: newWarehouse.name,
      address: newWarehouse.address,
      type: type,
      description: newWarehouse.description,
      state: newWarehouse.state,
      option: newWarehouse.option,
    });
    await warehouse.save();
    if (type == TYPE_WAREHOUSE.MAKER) {
      const maker = warehouse;
      res.status(200).json({ maker });
    } else {
      res.status(200).json({ warehouse });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update warehouse",
      error: <Error>err.message,
    });
  }
}

async function deleteWarehouse(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [space, api, url] = req.originalUrl.split("/");
    const type =
      url === "warehouse" ? TYPE_WAREHOUSE.HONDA : TYPE_WAREHOUSE.MAKER;
    const warehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: id },
    });
    if (!warehouse) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    warehouse.set({
      state: STATE.DELETED,
    });
    await warehouse.save();
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete warehouse",
      error: <Error>err.message,
    });
  }
}

export {
  getWarehouse,
  getListWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
