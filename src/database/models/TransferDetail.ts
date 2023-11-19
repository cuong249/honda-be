import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE, STATUS_TRANSFERDETAIL } from "../enum/enum";
import { sequelizeConnection } from "../database";

class TransferDetail extends Model {
  declare id: string;
  declare productId: string;
  declare categoryId: string;
  declare transferId: string;
  declare description: string;
  declare status: STATUS_TRANSFERDETAIL;
  declare state: STATE;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
TransferDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid(),
      primaryKey: true,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "product_id",
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "category_id",
    },
    transferId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "transfer_id",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: [
        STATUS_TRANSFERDETAIL.CANCEL,
        STATUS_TRANSFERDETAIL.SOLVE,
        STATUS_TRANSFERDETAIL.TRANSPORT,
        STATUS_TRANSFERDETAIL.SUCCESS,
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
    tableName: "TransferDetail",
    timestamps: true,
    charset: "utf8",
  }
);
export { TransferDetail };
