import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Permission } from "../database/models/Permission";
import { STATE } from "../database/enum/enum";

async function getPermission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const permission: Permission | null = await Permission.findOne({
      where: { id: id },
    });
    if (!permission) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    res.status(200).json({ permission });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find permission",
      error: <Error>err.message,
    });
  }
}

async function getListPermission(req: Request, res: Response) {
  try {
    const listPermission: Array<Permission> = await Permission.findAll();
    res.status(200).json({ permissions: listPermission });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find permission",
      error: <Error>err.message,
    });
  }
}

async function createPermission(req: Request, res: Response) {
  try {
    const reqPermission: Permission = req.body;
    if (!reqPermission.name || !reqPermission.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const permission: Permission = await Permission.create({
      id: uuid(),
      name: reqPermission.name,
      description: reqPermission.description,
      state: reqPermission.state,
      option: reqPermission.option,
    });
    if (permission) {
      res.status(200).json({ permission });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create permission",
      error: <Error>err.message,
    });
  }
}

async function updatePermission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newPermission: Permission = req.body;
    const permission: Permission | null = await Permission.findOne({
      where: { id: id },
    });
    if (!permission) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (!newPermission.name || !newPermission.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    permission.set({
      name: newPermission.name,
      description: newPermission.description,
      state: newPermission.state,
      option: newPermission.option,
    });
    await permission.save();
    res.status(200).json({ permission });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update permission",
      error: <Error>err.message,
    });
  }
}

async function deletePermission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const permission: Permission | null = await Permission.findOne({
      where: { id: id },
    });
    if (!permission) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    permission.set({
      state: STATE.DELETED,
    });
    await permission.save();
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete permission",
      error: <Error>err.message,
    });
  }
}

export {
  getPermission,
  getListPermission,
  createPermission,
  updatePermission,
  deletePermission,
};
