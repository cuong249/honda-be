import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE, IMPORT_SCAN } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Scan extends Model {
  declare id: string;
  declare productId: string;
  declare transferId: string;
  declare machineId: string;
  declare import: IMPORT_SCAN;
  declare state: STATE;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Scan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid(),
      primaryKey: true,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "product_id",
    },
    transferId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "transfer_id",
    },
    machineId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "machine_id",
    },
    import: {
      type: DataTypes.ENUM,
      values: [IMPORT_SCAN.SCAN, IMPORT_SCAN.ENTER],
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
    tableName: "Scan",
    timestamps: true,
    charset: "utf8",
  }
);
export { Scan };
