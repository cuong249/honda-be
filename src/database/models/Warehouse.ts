import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE, TYPE_WAREHOUSE } from "../enum/enum";
import { sequelizeConnection } from "../database";
import { Product } from "./Product";

class Warehouse extends Model {
  declare id: string;
  declare name: string;
  declare address: string;
  declare type: TYPE_WAREHOUSE;
  declare description: string;
  declare state: STATE;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Warehouse.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        TYPE_WAREHOUSE.MAKER,
        TYPE_WAREHOUSE.HONDA,
        TYPE_WAREHOUSE.OTHER,
      ],
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: "Warehouse",
    timestamps: false,
    charset: "utf8",
  }
);

// Warehouse.hasMany(Product);

export { Warehouse };
