import { Request, Response } from "express";
import { Transfer } from "../database/models/Transfer";
import { v4 as uuid } from "uuid";
import { TransferDetail } from "../database/models/TransferDetail";
import { Delivery } from "../database/models/Delivery";
import { Warehouse } from "../database/models/Warehouse";
import { Category } from "../database/models/Category";
import { Scan } from "../database/models/Scan";
import { ROLE, STATE } from "../database/enum/enum";
import { Product } from "../database/models/Product";
import { Op } from "sequelize";
import { Machine } from "../database/models/Machine";

async function getTakeout(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};
    const transfer: Transfer | null = await Transfer.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          queryObj,
        ],
      },
    });
    if (!transfer) {
      throw new Error("Id does not exist");
    }
    const listTransferDetail: Array<TransferDetail> =
      await TransferDetail.findAll({
        where: { transferId: transfer.id, state: STATE.ACTIVE },
      });
    const listScan: Array<Scan> = await Scan.findAll({
      where: { transferId: transfer.id, state: STATE.ACTIVE },
    });
    const listProduct: Array<Object> = new Array<Object>();
    for (var transferDetail of listTransferDetail) {
      const scanFound = listScan.find((scan) => {
        return scan.productId === transferDetail.productId;
      });
      if (scanFound) {
        listProduct.push({
          id: transferDetail.id,
          scanId: scanFound.id,
          productId: transferDetail.productId,
          categoryId: transferDetail.categoryId,
          description: transferDetail.description,
          status: transferDetail.status,
          state: transferDetail.state,
          option: transferDetail.option,
          machineId: scanFound.machineId,
          import: scanFound.import,
        });
      } else {
        listProduct.push({
          id: transferDetail.id,
          scanId: null,
          productId: transferDetail.productId,
          categoryId: transferDetail.categoryId,
          description: transferDetail.description,
          status: transferDetail.status,
          state: transferDetail.state,
          option: transferDetail.option,
          machineId: null,
          import: null,
        });
      }
    }
    for (var scan of listScan) {
      const ProductFound = listProduct.find((product) => {
        return (product as TransferDetail).productId === scan.productId;
      });
      if (ProductFound) {
        continue;
      } else {
        const product: Product | null = await Product.findOne({
          where: { id: scan.productId },
        });
        listProduct.push({
          id: null,
          scanId: scan.id,
          productId: scan.productId,
          categoryId: product?.categoryId,
          description: null,
          status: null,
          state: null,
          option: null,
          machineId: scan.machineId,
          import: scan.import,
        });
      }
    }
    const fromWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: transfer.fromWarehouseId },
    });
    if (fromWarehouse) transfer.setDataValue("fromWarehouse", fromWarehouse);
    const toWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: transfer.toWarehouseId },
    });
    if (toWarehouse) transfer.setDataValue("toWarehouse", toWarehouse);
    const machine: Machine | null = await Machine.findOne({
      where: { id: transfer.machineId },
    });
    if (machine) transfer.setDataValue("machine", machine);
    const takeout: Transfer = transfer;
    takeout.setDataValue("listProduct", listProduct);
    res.status(200).json({ takeout });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not get takeout",
      error: <Error>err.message,
    });
  }
}

async function getListTakeout(req: Request, res: Response) {
  try {
    const { limit, offset, order, search, arrange, query } = req.query;
    const queryObj = query ? JSON.parse(query as string) : {};

    const orderConditions: [string, string][] = [];

    if (order !== undefined && arrange !== undefined) {
      orderConditions.push([order as string, arrange as string]);
    } else {
      orderConditions.push(["createdAt", "DESC"]);
    }

    const { count, rows } = await Transfer.findAndCountAll({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderConditions,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                title: {
                  [Op.like]: search ? "%" + search + "%" : "%%",
                },
              },
            ],
          },
          queryObj,
        ],
      },
    });
    const listTransfer = rows;
    for (var transfer of listTransfer) {
      const listTransferDetail: Array<TransferDetail> =
        await TransferDetail.findAll({
          where: { transferId: transfer.id, state: STATE.ACTIVE },
        });
      const listScan: Array<Scan> = await Scan.findAll({
        where: { transferId: transfer.id, state: STATE.ACTIVE },
      });
      const listProduct: Array<Object> = new Array<Object>();
      for (var transferDetail of listTransferDetail) {
        const scanFound = listScan.find((scan) => {
          return scan.productId === transferDetail.productId;
        });
        if (scanFound) {
          listProduct.push({
            id: transferDetail.id,
            scanId: scanFound.id,
            productId: transferDetail.productId,
            categoryId: transferDetail.categoryId,
            description: transferDetail.description,
            status: transferDetail.status,
            state: transferDetail.state,
            option: transferDetail.option,
            machineId: scanFound.machineId,
            import: scanFound.import,
          });
        } else {
          listProduct.push({
            id: transferDetail.id,
            scanId: null,
            productId: transferDetail.productId,
            categoryId: transferDetail.categoryId,
            description: transferDetail.description,
            status: transferDetail.status,
            state: transferDetail.state,
            option: transferDetail.option,
            machineId: null,
            import: null,
          });
        }
      }
      for (var scan of listScan) {
        const ProductFound = listProduct.find((product) => {
          return (product as TransferDetail).productId === scan.productId;
        });
        if (ProductFound) {
          continue;
        } else {
          const product: Product | null = await Product.findOne({
            where: { id: scan.productId },
          });
          listProduct.push({
            id: null,
            scanId: scan.id,
            productId: scan.productId,
            categoryId: product?.categoryId,
            description: null,
            status: null,
            state: null,
            option: null,
            machineId: scan.machineId,
            import: scan.import,
          });
        }
      }
      const fromWarehouse: Warehouse | null = await Warehouse.findOne({
        where: { id: transfer.fromWarehouseId },
      });
      if (fromWarehouse) transfer.setDataValue("fromWarehouse", fromWarehouse);
      const toWarehouse: Warehouse | null = await Warehouse.findOne({
        where: { id: transfer.toWarehouseId },
      });
      if (toWarehouse) transfer.setDataValue("toWarehouse", toWarehouse);
      const takeout: Transfer = transfer;
      takeout.setDataValue("listProduct", listProduct);
    }
    res.status(200).json({
      amount: count,
      takeouts: listTransfer,
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not get takeout",
      error: <Error>err.message,
    });
  }
}

async function createTakeout(req: Request, res: Response) {
  try {
    const takeoutInfo: any = req.body;
    const listTransferDetailInfo: Array<TransferDetail> =
      takeoutInfo.listTransferDetail;
    if (
      !takeoutInfo.title ||
      !takeoutInfo.fromWarehouseId ||
      !takeoutInfo.toWarehouseId ||
      !takeoutInfo.transferDate ||
      !takeoutInfo.status ||
      !takeoutInfo.state
    ) {
      res.status(404);
      throw new Error("Missing data body");
    }
    if (takeoutInfo.deliveryId) {
      const delivery: Delivery | null = await Delivery.findOne({
        where: { id: takeoutInfo.deliveryId },
      });
      if (!delivery) {
        res.status(404);
        throw new Error("Delivery id does not exist");
      }
    }
    const fromWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: takeoutInfo.fromWarehouseId },
    });
    if (!fromWarehouse) {
      res.status(404);
      throw new Error("From warehouse does not exist");
    }
    const toWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: takeoutInfo.toWarehouseId },
    });
    if (!toWarehouse) {
      res.status(404);
      throw new Error("To warehouse does not exist");
    }
    for (var transferDetailInfo of listTransferDetailInfo) {
      if (
        !transferDetailInfo.categoryId ||
        !transferDetailInfo.description ||
        !transferDetailInfo.status ||
        !transferDetailInfo.state
      ) {
        res.status(404);
        throw new Error("Transfer detail missing data body");
      }
      const category: Category | null = await Category.findOne({
        where: { id: transferDetailInfo.categoryId },
      });
      if (!category) {
        res.status(404);
        throw new Error("Category of product does not exist");
      }
    }
    const transfer: Transfer = await Transfer.create({
      id: uuid(),
      title: takeoutInfo.title,
      deliveryId: takeoutInfo.deliveryId,
      fromWarehouseId: takeoutInfo.fromWarehouseId,
      toWarehouseId: takeoutInfo.toWarehouseId,
      transferDate: takeoutInfo.transferDate,
      status: takeoutInfo.status,
      state: takeoutInfo.state,
      option: takeoutInfo.option,
    });
    let listTransferDetail: Array<TransferDetail> = new Array<TransferDetail>();
    for (var transferDetailInfo of listTransferDetailInfo) {
      const transferDetail: TransferDetail = await TransferDetail.create({
        id: uuid(),
        productId: transferDetailInfo.productId,
        categoryId: transferDetailInfo.categoryId,
        transferId: transfer.id,
        description: transferDetailInfo.description,
        status: transferDetailInfo.status,
        state: transferDetailInfo.state,
        option: transferDetailInfo.option,
      });
      listTransferDetail.push(transferDetail);
    }
    const takeout: Transfer = transfer;
    takeout.setDataValue("listProduct", listTransferDetail);
    res.status(200).json({ takeout });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update takeout",
      error: <Error>err.message,
    });
  }
}

async function updateTakeout(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const listTransferDetailInfo: Array<TransferDetail> = req.body.listProduct;
    const takeoutInfo: Transfer = req.body;
    //Check transfer id
    const transfer: Transfer | null = await Transfer.findOne({
      where: { id: id },
    });
    if (!transfer) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    //Check info req
    if (
      !takeoutInfo.title ||
      !takeoutInfo.fromWarehouseId ||
      !takeoutInfo.toWarehouseId ||
      !takeoutInfo.transferDate ||
      !takeoutInfo.status ||
      !takeoutInfo.state
    ) {
      res.status(404);
      throw new Error("Missing data body");
    }
    // check delivery id if it exist
    if (takeoutInfo.deliveryId) {
      const delivery: Delivery | null = await Delivery.findOne({
        where: { id: takeoutInfo.deliveryId },
      });
      if (!delivery) {
        res.status(404);
        throw new Error("Delivery id does not exist");
      }
    }
    //check warehouse id
    const fromWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: takeoutInfo.fromWarehouseId },
    });
    if (!fromWarehouse) {
      res.status(404);
      throw new Error("From warehouse does not exist");
    }
    const toWarehouse: Warehouse | null = await Warehouse.findOne({
      where: { id: takeoutInfo.toWarehouseId },
    });
    if (!toWarehouse) {
      res.status(404);
      throw new Error("To warehouse does not exist");
    }
    //check info of list product
    for (var transferDetailInfo of listTransferDetailInfo) {
      if (
        !transferDetailInfo.id ||
        !transferDetailInfo.categoryId ||
        !transferDetailInfo.description ||
        !transferDetailInfo.status ||
        !transferDetailInfo.state
      ) {
        res.status(404);
        throw new Error("Transfer detail missing data body");
      }
      const category: Category | null = await Category.findOne({
        where: { id: transferDetailInfo.categoryId },
      });
      if (!category) {
        res.status(404);
        throw new Error("Category of product does not exist");
      }
    }
    //create takeout
    transfer.set({
      title: takeoutInfo.title,
      deliveryId: takeoutInfo.deliveryId,
      fromWarehouseId: takeoutInfo.fromWarehouseId,
      toWarehouseId: takeoutInfo.toWarehouseId,
      transferDate: takeoutInfo.transferDate,
      status: takeoutInfo.status,
      state: takeoutInfo.state,
      option: takeoutInfo.option,
    });
    await transfer.save();
    let listTransferDetail: Array<TransferDetail> = new Array<TransferDetail>();
    for (var transferDetailInfo of listTransferDetailInfo) {
      const transferDetail: TransferDetail | null =
        await TransferDetail.findOne({
          where: { id: transferDetailInfo.id },
        });
      if (transferDetail) {
        transferDetail.set({
          productId: transferDetailInfo.productId,
          categoryId: transferDetailInfo.categoryId,
          transferId: transfer.id,
          description: transferDetailInfo.description,
          status: transferDetailInfo.status,
          state: transferDetailInfo.state,
          option: transferDetailInfo.option,
        });
        listTransferDetail.push(transferDetail);
      } else {
        res.status(404);
        throw new Error("Transfer detail id does not exist");
      }
    }
    const takeout: Transfer = transfer;
    takeout.setDataValue("listProduct", listTransferDetail);
    res.status(200).json({ takeout });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create takeout",
      error: <Error>err.message,
    });
  }
}

async function deleteTakeout(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const transfer: Transfer | null = await Transfer.findOne({
      where: { id: id },
    });
    if (!transfer) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    transfer.set({
      state: STATE.DELETED,
    });
    const listTransferDetail: Array<TransferDetail> =
      await TransferDetail.findAll({ where: { transferId: transfer.id } });
    for (var transferDetail of listTransferDetail) {
      transferDetail.set({
        state: STATE.DELETED,
      });
      transferDetail.save();
    }
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete takeout",
      error: <Error>err.message,
    });
  }
}

export {
  getTakeout,
  getListTakeout,
  createTakeout,
  updateTakeout,
  deleteTakeout,
};
