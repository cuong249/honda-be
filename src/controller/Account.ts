import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Account } from "../database/models/Account";
import { ROLE, STATE, TYPE_WAREHOUSE } from "../database/enum/enum";
import { Warehouse } from "../database/models/Warehouse";
import { Op } from "sequelize";

async function getAccountInfo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};
    let account: Account | null = new Account();
    account = await Account.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          queryObj,
        ],
      },
    });
    if (!account) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    if (account.role == ROLE.WAREHOUSE || account.role == ROLE.MAKER) {
      const warehouse: Warehouse | null = await Warehouse.findOne({
        where: {
          [Op.and]: [
            { id: account.warehouseId },
            {
              type:
                account.role == ROLE.WAREHOUSE
                  ? TYPE_WAREHOUSE.HONDA
                  : TYPE_WAREHOUSE.MAKER,
            },
            {
              state: STATE.ACTIVE,
            },
          ],
        },
      });
      if (warehouse) {
        account.setDataValue("warehouse", warehouse);
      }
    }
    res.status(200).json({ account });
  } catch (err: any) {
    const statusCode = res.statusCode ? res.statusCode : 404;
    res.status(statusCode).json({
      message: "Could not find account!",
      error: <Error>err.message,
    });
  }
}

async function getListAccount(req: Request, res: Response) {
  try {
    const { limit, offset, order, search, arrange, query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    const orderConditions: [string, string][] = [];

    if (order !== undefined && arrange !== undefined) {
      orderConditions.push([order as string, arrange as string]);
    } else {
      orderConditions.push(["createdAt", "DESC"]);
    }

    const { count, rows } = await Account.findAndCountAll({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderConditions,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                firstName: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
              {
                lastName: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
              {
                phone: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
              {
                email: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
            ],
          },
          queryObj,
        ],
      },
    });
    const listAccount = rows;

    for (var account of listAccount) {
      if (account.role == ROLE.WAREHOUSE || account.role == ROLE.MAKER) {
        const warehouse: Warehouse | null = await Warehouse.findOne({
          where: {
            [Op.and]: [
              { id: account.warehouseId },
              {
                type:
                  account.role == ROLE.WAREHOUSE
                    ? TYPE_WAREHOUSE.HONDA
                    : TYPE_WAREHOUSE.MAKER,
              },
              {
                state: STATE.ACTIVE,
              },
            ],
          },
        });
        if (warehouse) {
          account.setDataValue("warehouse", warehouse);
        }
      }
    }
    res.status(200).json({ amount: count, accounts: listAccount });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find account!",
      error: <Error>err.message,
    });
  }
}

async function createAccount(req: Request, res: Response) {
  try {
    const reqAccount: Account = req.body;

    if (
      !reqAccount.firstName ||
      !reqAccount.lastName ||
      !reqAccount.birthday ||
      !reqAccount.phone ||
      !reqAccount.email ||
      !reqAccount.role ||
      !reqAccount.password ||
      !reqAccount.state
    ) {
      res.status(404);
      throw new Error("Missing data body");
    }
    await Account.findOne({ where: { email: reqAccount.email } }).then(
      (account) => {
        if (account) {
          res.status(403);
          throw new Error("Email already exist");
        }
      }
    );
    await Account.findOne({ where: { phone: reqAccount.phone } }).then(
      (account) => {
        if (account) {
          res.status(403);
          throw new Error("Phone already exist");
        }
      }
    );
    switch (reqAccount.role) {
      case ROLE.ADMIN:
        break;
      case ROLE.DELIVERY:
        break;
      case ROLE.MAKER:
        const warehouse: Warehouse | null = await Warehouse.findOne({
          where: {
            [Op.and]: [
              { id: reqAccount.warehouseId },
              {
                type: TYPE_WAREHOUSE.MAKER,
              },
              {
                state: STATE.ACTIVE,
              },
            ],
          },
        });
        if (!warehouse) {
          res.status(422);
          throw new Error("Warehouse id does not exist");
        }
        break;
      case ROLE.WAREHOUSE:
        const warehouse1: Warehouse | null = await Warehouse.findOne({
          where: {
            [Op.and]: [
              { id: reqAccount.warehouseId },
              {
                type: TYPE_WAREHOUSE.HONDA,
              },
              {
                state: STATE.ACTIVE,
              },
            ],
          },
        });
        if (!warehouse1) {
          res.status(422);
          throw new Error("Warehouse id does not exist");
        }
        break;
      default:
        res.status(422);
        throw new Error("ROLE does not exist");
        break;
    }
    const account = await Account.create({
      id: uuid(),
      firstName: reqAccount.firstName,
      lastName: reqAccount.lastName,
      displayName: reqAccount.firstName + reqAccount.lastName,
      birthday: reqAccount.birthday,
      phone: reqAccount.phone,
      email: reqAccount.email,
      role: reqAccount.role,
      warehouseId: reqAccount.warehouseId,
      password: reqAccount.password,
      rfid: reqAccount.rfid,
      state: reqAccount.state,
      option: reqAccount.option,
    });
    if (account) {
      res.status(200).json({ account });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create account!",
      error: <Error>err.message,
    });
  }
}

async function updateAccount(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const roleJwt = res.locals.role;
    const newAccount: Account = req.body;
    const account: Account | null = await Account.findOne({
      where: { id: id },
    });
    if (!account) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (account.state === STATE.INACTIVE && roleJwt !== ROLE.ADMIN) {
      res.status(403);
      throw new Error("Inactive Account");
    }
    if (
      !newAccount.firstName ||
      !newAccount.lastName ||
      !newAccount.birthday ||
      !newAccount.phone ||
      !newAccount.email ||
      !newAccount.role ||
      !newAccount.password ||
      !newAccount.state
    ) {
      res.status(422);
      throw new Error("Missing data body");
    }
    if (account.email !== newAccount.email) {
      await Account.findOne({ where: { email: newAccount.email } }).then(
        (account) => {
          if (account) {
            res.status(403);
            throw new Error("Email already exist");
          }
        }
      );
    }
    if (account.phone !== newAccount.phone) {
      await Account.findOne({ where: { phone: newAccount.phone } }).then(
        (account) => {
          if (account) {
            res.status(403);
            throw new Error("Phone already exist");
          }
        }
      );
    }
    switch (newAccount.role) {
      case ROLE.ADMIN:
        break;
      case ROLE.DELIVERY:
        break;
      case ROLE.MAKER:
        const warehouse: Warehouse | null = await Warehouse.findOne({
          where: {
            [Op.and]: [
              { id: newAccount.warehouseId },
              {
                type: TYPE_WAREHOUSE.MAKER,
              },
              {
                state: STATE.ACTIVE,
              },
            ],
          },
        });
        if (!warehouse) {
          res.status(422);
          throw new Error("Warehouse id does not exist");
        }
        break;
      case ROLE.WAREHOUSE:
        const warehouse1: Warehouse | null = await Warehouse.findOne({
          where: {
            [Op.and]: [
              { id: newAccount.warehouseId },
              {
                type: TYPE_WAREHOUSE.HONDA,
              },
              {
                state: STATE.ACTIVE,
              },
            ],
          },
        });
        if (!warehouse1) {
          res.status(422);
          throw new Error("Warehouse id does not exist");
        }
        break;
      default:
        res.status(422);
        throw new Error("ROLE does not exist");
        break;
    }
    if (roleJwt === ROLE.ADMIN) {
      account.set({
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        displayName: newAccount.firstName + newAccount.lastName,
        birthday: newAccount.birthday,
        phone: newAccount.phone,
        email: newAccount.email,
        role: newAccount.role,
        warehouseId: newAccount.warehouseId,
        password: newAccount.password,
        rfid: newAccount.rfid,
        state: newAccount.state,
        option: newAccount.option,
      });
    } else {
      account.set({
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        displayName: newAccount.firstName + newAccount.lastName,
        birthday: newAccount.birthday,
        phone: newAccount.phone,
        email: newAccount.email,
        role: newAccount.role,
        warehouseId: newAccount.warehouseId,
        password: newAccount.password,
        rfid: newAccount.rfid,
        // state: newAccount.state,
        option: newAccount.option,
      });
    }
    await account.save();
    res.status(200).json({ account });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update account!",
      error: <Error>err.message,
    });
  }
}

async function deleteAccount(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const account: Account | null = await Account.findOne({
      where: { id: id },
    });
    if (!account) {
      res.status(404);
      throw new Error("Id does not exist!");
    } else {
      account.set({
        state: STATE.DELETED,
      });
      await account.save();
      res.status(200).json({
        message: "Delete successfully!",
      });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete account!",
      error: <Error>err.message,
    });
  }
}

export {
  getAccountInfo,
  getListAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};
