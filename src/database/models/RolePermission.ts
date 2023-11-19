import { DataTypes, Model } from "sequelize";
import { sequelizeConnection } from "../database";

class RolePermission extends Model {
  declare roleId: string;
  declare permissionId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
RolePermission.init(
  {
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "role_id",
    },
    permissionId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "permission_id",
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
    tableName: "RolePermission",
    timestamps: true,
    charset: "utf8",
  }
);
export { RolePermission };
