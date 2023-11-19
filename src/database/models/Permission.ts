import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";
import { STATE } from "../enum/enum";
import { sequelizeConnection } from "../database";

class Permission extends Model {
  declare id: string;
  declare name: string;
  declare description: string;
  declare option: string;
  declare state: STATE;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Permission.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    option: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.ENUM,
      values: [STATE.ACTIVE, STATE.INACTIVE, STATE.DELETED],
      allowNull: false,
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
    tableName: "Permission",
    timestamps: true,
    charset: "utf8",
  }
);
export { Permission };
