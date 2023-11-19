import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE, STATUS_TRANSFER } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Transfer extends Model {
  declare id: string;
  declare title: string;
  declare deliveryId: string;
  declare fromWarehouseId: string;
  declare toWarehouseId: string;
  declare machineId: string;
  declare transferDate: string;
  declare status: STATUS_TRANSFER;
  declare state: STATE;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Transfer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "delivery_id",
    },
    fromWarehouseId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "from_warehouse_id",
    },
    toWarehouseId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "to_warehouse_id",
    },
    machineId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "machine_id",
    },
    transferDate: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "transfer_date",
      get() {
        return this.getDataValue("createdAt").getTime();
      },
    },
    status: {
      type: DataTypes.ENUM,
      values: [
        STATUS_TRANSFER.FIND,
        STATUS_TRANSFER.SCANNING,
        STATUS_TRANSFER.TRANSFER,
        STATUS_TRANSFER.SUCCESS,
      ],
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM,
      values: [STATE.ACTIVE, STATE.INACTIVE, STATE.DELETED],
      allowNull: false,
    },

    option: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: "TIMESTAMP",
      allowNull: false,
      get() {
        return this.getDataValue("createdAt").getTime();
      },
    },
    updatedAt: {
      type: "TIMESTAMP",
      allowNull: false,
      get() {
        return this.getDataValue("createdAt").getTime();
      },
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "Transfer",
    timestamps: true,
    charset: "utf8",
  }
);
export { Transfer };
