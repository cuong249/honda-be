import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE_MAINTENANCE } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Maintenance extends Model {
  declare id: string;
  declare productId: string;
  declare startDate: Date;
  declare finishDate: Date;
  declare description: string;
  declare state: STATE_MAINTENANCE;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Maintenance.init(
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return this.getDataValue("startDate").getTime();
      },
      field: "start_date",
    },
    finishDate: {
      type: DataTypes.DATE,
      allowNull: true,
      get() {
        if (this.getDataValue("finishDate")) {
          return this.getDataValue("finishDate").getTime();
        }
      },
      field: "finish_date",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.ENUM,
      values: [
        STATE_MAINTENANCE.COMPLETED,
        STATE_MAINTENANCE.DOING,
        STATE_MAINTENANCE.DELETED,
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
    tableName: "Maintenance",
    timestamps: true,
    charset: "utf8",
  }
);

// Warehouse.hasMany(Product);

export { Maintenance };
