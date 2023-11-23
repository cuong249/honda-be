import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE_MAINTAIN } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Product extends Model {
  declare id: string;
  declare name: string;
  declare rfid: string;
  declare numberCode: string;
  declare categoryId: string;
  declare storageWarehouseId: string;
  declare deliveryWarehouseId: string;
  declare currentWarehouseId: string;
  declare maintainNext: Date;
  declare state: STATE_MAINTAIN;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Product.init(
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
    rfid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "number_code",
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "category_id",
    },
    storageWarehouseId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "storage_warehouse_id",
    },
    deliveryWarehouseId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "delivery_warehouse_id",
    },
    currentWarehouseId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "current_warehouse_id",
    },
    maintainNext: {
      type: DataTypes.DATE,
      allowNull: true,
      get() {
        if (this.getDataValue("maintainNext")) {
          return this.getDataValue("maintainNext").getTime();
        }
      },
      field: "maintain_next",
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
    tableName: "Product",
    timestamps: true,
    charset: "utf8",
  }
);

// Product.belongsTo(Warehouse, {
//   as: "storage",
//   foreignKey: "storageWarehouseId",
// });

// Product.belongsTo(Warehouse, {
//   as: "delivery",
//   foreignKey: "deliveryWarehouseId",
// });
// Product.belongsTo(Warehouse, {
//   as: "current",
//   foreignKey: "currentWarehouseId",
// });

export { Product };
