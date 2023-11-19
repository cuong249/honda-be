import { NextFunction, Request, Response } from "express";
import { ROLE } from "../database/enum/enum";

async function adminOrOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const idReq = res.locals.id;
    const role = res.locals.role;
    if (role == ROLE.ADMIN) {
      next();
    } else {
      if (id == idReq) {
        next();
      } else {
        res.status(403);
        throw new Error("You must be admin or owner");
      }
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode!).json({
      message: "You are not permission",
      error: <Error>err.message,
    });
  }
}
async function admin(req: Request, res: Response, next: NextFunction) {
  try {
    const role = res.locals.role;
    if (role == ROLE.ADMIN) {
      next();
    } else {
      res.status(403);
      throw new Error("You are not admin");
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode!).json({
      message: "You are not permission",
      error: <Error>err.message,
    });
  }
}
async function adminOrMaker(req: Request, res: Response, next: NextFunction) {
  try {
    const role = res.locals.role;
    if (role == ROLE.ADMIN || role == ROLE.MAKER) {
      next();
    }
    res.status(403);
    throw new Error("You must be admin or Maker");
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode!).json({
      message: "You are not permission",
      error: <Error>err.message,
    });
  }
}

async function adminOrWarehouse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const role = res.locals.role;
    if (role !== ROLE.ADMIN && role !== ROLE.WAREHOUSE) {
      res.status(403);
      throw new Error("You must be admin or warehouse");
    }
    next();
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode!).json({
      message: "You are not permission",
      error: <Error>err.message,
    });
  }
}

export { adminOrOwner, admin, adminOrMaker, adminOrWarehouse };
