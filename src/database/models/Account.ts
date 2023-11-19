import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { ROLE, STATE } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Account extends Model {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare displayName: string;
  declare birthday: Date;
  declare phone: string;
  declare email: string;
  declare role: ROLE;
  declare warehouseId: string;
  declare password: string;
  declare rfid: string;
  declare token: string;
  declare state: STATE;
  declare option: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid(),
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "full_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "last_name",
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "display_name",
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return this.getDataValue("birthday").getTime();
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: [ROLE.ADMIN, ROLE.MAKER, ROLE.DELIVERY, ROLE.WAREHOUSE],
      allowNull: false,
    },

    warehouseId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rfid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    token: {
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
    tableName: "Account",
    timestamps: true,
    charset: "utf8",
  }
);
export { Account };
