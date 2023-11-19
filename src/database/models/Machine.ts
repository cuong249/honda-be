import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE_MAINTAIN, TYPE_MACHINE } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Machine extends Model {
  declare id: string;
  declare name: string;
  declare type: TYPE_MACHINE;
  declare warehouseId: string;
  declare location: string;
  declare state: STATE_MAINTAIN;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Machine.init(
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
    type: {
      type: DataTypes.ENUM,
      values: [TYPE_MACHINE.FIXED, TYPE_MACHINE.MOVING],
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "warehouse_id",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM,
      values: [
        STATE_MAINTAIN.ACTIVE,
        STATE_MAINTAIN.INACTIVE,
        STATE_MAINTAIN.MAINTAIN,
        STATE_MAINTAIN.DELETED,
      ],
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
    tableName: "Machine",
    timestamps: true,
    charset: "utf8",
  }
);
export { Machine };
