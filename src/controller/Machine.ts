import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Machine } from "../database/models/Machine";
import { ROLE, STATE, STATE_MAINTAIN } from "../database/enum/enum";
import { Warehouse } from "../database/models/Warehouse";
import { Op } from "sequelize";

async function getMachine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    let machine: Machine | null = new Machine();
    machine = await Machine.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          queryObj,
        ],
      },
    });
    if (!machine) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    const warehouse: Warehouse | null = await Warehouse.findOne({
      where: {
        id: machine.warehouseId,
        state: STATE.ACTIVE,
      },
    });
    if (warehouse) {
      machine.setDataValue("warehouse", warehouse);
    }
    res.status(200).json({ machine });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find machine",
      error: <Error>err.message,
    });
  }
}

async function getListMachine(req: Request, res: Response) {
  try {
    const { limit, offset, order, search, arrange, query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    const orderConditions: [string, string][] = [];

    if (order !== undefined && arrange !== undefined) {
      orderConditions.push([order as string, arrange as string]);
    } else {
      orderConditions.push(["createdAt", "DESC"]);
    }

    const { count, rows } = await Machine.findAndCountAll({
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
            ],
          },
          queryObj,
        ],
      },
    });

    const listMachine = rows;

    for (var machine of listMachine) {
      const warehouse = await Warehouse.findOne({
        where: { id: machine.warehouseId, state: STATE.ACTIVE },
      });

      if (warehouse) {
        machine.setDataValue("warehouse", warehouse);
      }
    }
    res.status(200).json({ amount: count, machines: listMachine });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find machine",
      error: <Error>err.message,
    });
  }
}

async function createMachine(req: Request, res: Response) {
  try {
    const reqMachine: Machine = req.body;
    if (
      !reqMachine.name ||
      !reqMachine.type ||
      !reqMachine.warehouseId ||
      !reqMachine.location ||
      !reqMachine.state
    ) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const warehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: reqMachine.warehouseId, state: STATE.ACTIVE },
    });
    if (!warehouse) {
      res.status(422);
      throw new Error("Warehouse Id does not exist");
    }
    const machine: Machine = await Machine.create({
      id: uuid(),
      name: reqMachine.name,
      type: reqMachine.type,
      warehouseId: reqMachine.warehouseId,
      location: reqMachine.location,
      state: reqMachine.state,
      option: reqMachine.option,
    });
    if (machine) {
      res.status(200).json({ machine });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create machine",
      error: <Error>err.message,
    });
  }
}

async function updateMachine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newMachine: Machine = req.body;
    const machine: Machine | null = await Machine.findOne({
      where: { id: id },
    });
    if (!machine) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    const warehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: newMachine.warehouseId, state: STATE.ACTIVE },
    });
    if (!warehouse) {
      res.status(422);
      throw new Error("Warehouse id does not exist");
    }
    if (
      !newMachine.name ||
      !newMachine.type ||
      !newMachine.warehouseId ||
      !newMachine.location ||
      !newMachine.state
    ) {
      res.status(422);
      throw new Error("Missing data body");
    }
    machine.set({
      name: newMachine.name,
      type: newMachine.type,
      warehouseId: newMachine.warehouseId,
      location: newMachine.location,
      state: newMachine.state,
      option: newMachine.option,
    });
    await machine.save();
    res.status(200).json({ machine });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update machine",
      error: <Error>err.message,
    });
  }
}

async function deleteMachine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const machine: Machine | null = await Machine.findOne({
      where: { id: id },
    });
    if (!machine) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    machine.set({
      state: STATE_MAINTAIN.DELETED,
    });
    await machine.save();
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete machine",
      error: <Error>err.message,
    });
  }
}

export {
  getMachine,
  getListMachine,
  createMachine,
  updateMachine,
  deleteMachine,
};
