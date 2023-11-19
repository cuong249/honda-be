import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Delivery } from "../database/models/Delivery";
import { ROLE, STATE } from "../database/enum/enum";
import { Account } from "../database/models/Account";
import { Op } from "sequelize";

async function getDelivery(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const role = res.locals.role;
    let delivery: Delivery | null = new Delivery();
    delivery = await Delivery.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          {
            state:
              role === ROLE.ADMIN
                ? [STATE.ACTIVE, STATE.INACTIVE]
                : STATE.ACTIVE,
          },
        ],
      },
    });

    if (!delivery) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    res.status(200).json({ delivery });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find delivery",
      error: <Error>err.message,
    });
  }
}

async function getListDelivery(req: Request, res: Response) {
  try {
    const role = res.locals.role;
    let listDelivery: Array<Delivery> = new Array<Delivery>();

    if (role == ROLE.ADMIN) {
      listDelivery = await Delivery.findAll();
    } else {
      listDelivery = await Delivery.findAll({
        where: { state: STATE.ACTIVE },
      });
    }
    res.status(200).json({ deliveries: listDelivery });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find delivery",
      error: <Error>err.message,
    });
  }
}

async function createDelivery(req: Request, res: Response) {
  try {
    const reqDelivery: Delivery = req.body;
    if (!reqDelivery.name || !reqDelivery.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const account: Account | null = await Account.findOne({
      where: { id: reqDelivery.accountId },
    });
    if (!account) {
      res.status(404);
      throw new Error("Account id does not exist");
    }
    const delivery: Delivery = await Delivery.create({
      id: uuid(),
      name: reqDelivery.name,
      state: reqDelivery.state,
      option: reqDelivery.option,
    });
    if (delivery) {
      res.status(200).json({ delivery });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create Delivery",
      error: <Error>err.message,
    });
  }
}

async function updateDelivery(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newDelivery: Delivery = req.body;
    const delivery: Delivery | null = await Delivery.findOne({
      where: { id: id },
    });
    if (!delivery) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (
      !newDelivery.name ||
      !newDelivery.state ||
      !newDelivery.accountId ||
      !newDelivery.carNumber
    ) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const account: Account | null = await Account.findOne({
      where: { id: newDelivery.accountId },
    });
    if (!account) {
      res.status(404);
      throw new Error("Account id does not exist");
    }
    delivery.set({
      name: newDelivery.name,
      state: newDelivery.state,
      option: newDelivery.option,
    });
    await delivery.save();
    res.status(200).json({ delivery });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update delivery",
      error: <Error>err.message,
    });
  }
}

async function deleteDelivery(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const delivery: Delivery | null = await Delivery.findOne({
      where: { id: id },
    });
    if (!delivery) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    delivery.set({
      state: STATE.DELETED,
    });
    await delivery.save();
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete delivery",
      error: <Error>err.message,
    });
  }
}
export {
  getDelivery,
  getListDelivery,
  createDelivery,
  updateDelivery,
  deleteDelivery,
};
