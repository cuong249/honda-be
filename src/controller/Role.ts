import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Role } from "../database/models/Role";
import { STATE } from "../database/enum/enum";
import { RolePermission } from "../database/models/RolePermission";
import { Permission } from "../database/models/Permission";

async function getRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const role: Role | null = await Role.findOne({
      where: { id: id },
    });
    if (!role) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    const listRolePermission: Array<RolePermission> =
      await RolePermission.findAll({
        where: { roleId: role.id },
      });
    const listPermission: Array<Permission> = new Array<Permission>();
    if (listRolePermission) {
      for (var rolePermission of listRolePermission) {
        const permission: Permission | null = await Permission.findOne({
          where: { id: rolePermission.permissionId },
        });
        if (permission) {
          listPermission.push(permission);
        }
      }
    }
    role.setDataValue("listPermission", listPermission);
    res.status(200).json({ role });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find role",
      error: <Error>err.message,
    });
  }
}

async function getListRole(req: Request, res: Response) {
  try {
    const listRole: Array<Role> = await Role.findAll();
    for (var role of listRole) {
      const listRolePermission: Array<RolePermission> =
        await RolePermission.findAll({
          where: { roleId: role.id },
        });
      const listPermission: Array<Permission> = new Array<Permission>();
      if (listRolePermission) {
        for (var rolePermission of listRolePermission) {
          const permission: Permission | null = await Permission.findOne({
            where: { id: rolePermission.permissionId },
          });
          if (permission) {
            listPermission.push(permission);
          }
        }
      }
      role.setDataValue("listPermission", listPermission);
    }
    res.status(200).json({ roles: listRole });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find role",
      error: <Error>err.message,
    });
  }
}

async function createRole(req: Request, res: Response) {
  try {
    const listPermission: Array<Permission> = req.body.listPermission;
    const reqRole: Role = req.body;
    if (!reqRole.name || !reqRole.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    if (listPermission) {
      for (var permission of listPermission) {
        const permissionFound: Permission | null = await Permission.findOne({
          where: { id: permission.id },
        });
        if (!permissionFound) {
          res.status(404);
          throw new Error("Permission id does not exit");
        }
      }
    }
    const role: Role = await Role.create({
      id: uuid(),
      name: reqRole.name,
      description: reqRole.description,
      state: reqRole.state,
      option: reqRole.option,
    });
    const listPermissionCreated: Array<Permission> = new Array<Permission>();
    if (listPermission) {
      for (var permission of listPermission) {
        const rolePermission: RolePermission = await RolePermission.create({
          roleId: role.id,
          permissionId: permission.id,
        });
        const permissionFound: Permission | null = await Permission.findOne({
          where: { id: permission.id },
        });
        if (permissionFound) {
          listPermissionCreated.push(permissionFound);
        }
      }
    }
    role.setDataValue("listPermission", listPermissionCreated);
    if (role) {
      res.status(200).json({ role });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create role",
      error: <Error>err.message,
    });
  }
}

async function updateRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newRole: Role = req.body;
    const listPermissionNew: Array<Permission> = req.body.listPermission;
    const role: Role | null = await Role.findOne({
      where: { id: id },
    });
    if (!role) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (!newRole.name || !newRole.state) {
      res.status(422);
      throw new Error("Missing data body");
    }

    if (listPermissionNew) {
      for (var permission of listPermissionNew) {
        const permissionFound: Permission | null = await Permission.findOne({
          where: { id: permission.id },
        });
        if (!permissionFound) {
          res.status(404);
          throw new Error("Permission id does not exit");
        }
      }
    }
    role.set({
      name: newRole.name,
      description: newRole.description,
      state: newRole.state,
      option: newRole.option,
    });
    await role.save();

    //delete old permission
    const listRolePermissionOld: Array<RolePermission> =
      await RolePermission.findAll({ where: { roleId: role.id } });
    for (var rolePermission of listRolePermissionOld) {
      const rolePermissionFound = listPermissionNew.find((permission) => {
        return permission.id === rolePermission.permissionId;
      });
      if (!rolePermissionFound) {
        await rolePermission.destroy();
      }
    }
    //add new permission
    const listRolePermission: Array<RolePermission> =
      await RolePermission.findAll({ where: { roleId: role.id } });
    const listPermissionRes: Array<Permission> = new Array<Permission>();
    for (var permission of listPermissionNew) {
      const rolePermissionFound = listRolePermission.find((rolePermission) => {
        return rolePermission.permissionId === permission.id;
      });
      if (!rolePermissionFound) {
        await RolePermission.create({
          permissionId: permission.id,
          roleId: role.id,
        });
      }
      const permissionFound: Permission | null = await Permission.findOne({
        where: { id: permission.id },
      });
      if (permissionFound) {
        listPermissionRes.push(permissionFound);
      }
    }
    role.setDataValue("listPermission", listPermissionRes);
    res.status(200).json({ role });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update role",
      error: <Error>err.message,
    });
  }
}

async function deleteRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const role: Role | null = await Role.findOne({
      where: { id: id },
    });
    if (!role) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    role.set({
      state: STATE.DELETED,
    });
    await role.save();
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete role",
      error: <Error>err.message,
    });
  }
}

export { getRole, getListRole, createRole, updateRole, deleteRole };
