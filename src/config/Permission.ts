import { STATE } from "../database/enum/enum";
import { v4 as uuid } from "uuid";
import { Permission } from "../database/models/Permission";

async function createPermission() {
  await Permission.create({
    id: uuid(),
    name: "Permission 1",
    description: "Permission for edit ABC",
    state: STATE.ACTIVE,
    option: "",
  });
  await Permission.create({
    id: uuid(),
    name: "Permission 2",
    description: "Permission for edit DEF",
    state: STATE.ACTIVE,
    option: "",
  });
  await Permission.create({
    id: uuid(),
    name: "Permission 3",
    description: "Permission for edit GHI",
    state: STATE.ACTIVE,
    option: "",
  });
  await Permission.create({
    id: uuid(),
    name: "Permission 4",
    description: "Permission for edit KLM",
    state: STATE.ACTIVE,
    option: "",
  });
}

export { createPermission };
