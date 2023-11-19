import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Category } from "../database/models/Category";
import { STATE } from "../database/enum/enum";

async function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const category: Category | null = await Category.findOne({
      where: { id: id, state: STATE.ACTIVE },
    });
    if (!category) {
      res.status(404);
      throw new Error("Id does not exit");
    }
    res.status(200).json({ category });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find category",
      error: <Error>err.message,
    });
  }
}

async function getListCategory(req: Request, res: Response) {
  try {
    const listCategory: Array<Category> = await Category.findAll({
      where: { state: STATE.ACTIVE },
    });

    res.status(200).json({ categories: listCategory });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find category",
      error: <Error>err.message,
    });
  }
}

async function getListCategoryWithChild(req: Request, res: Response) {
  try {
    const listCategory: Array<Category> = await Category.findAll({
      where: { parentId: null, state: STATE.ACTIVE },
    });
    const listCategoryChild = await findChildCategory(listCategory);

    res.status(200).json({ categories: listCategoryChild });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not find category",
      error: <Error>err.message,
    });
  }

  async function findChildCategory(listCategory: Array<Category>) {
    for (var category of listCategory) {
      const listCategoryChild: Array<Category> = await Category.findAll({
        where: { parentId: category.id, state: STATE.ACTIVE },
      });
      if (listCategoryChild.length != 0) {
        const listCategoryChild2 = await findChildCategory(listCategoryChild);
        category.setDataValue("child", listCategoryChild2);
      } else {
        category.setDataValue("child", []);
      }
    }
    return listCategory;
  }
}

async function createCategory(req: Request, res: Response) {
  try {
    const reqCategory: Category = req.body;
    if (!reqCategory.name || !reqCategory.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const categoryFound = await Category.findOne({
      where: { id: reqCategory.parentId },
    });
    if (!categoryFound) {
      res.status(404);
      throw new Error("Parent id does not exist");
    }
    const category: Category = await Category.create({
      id: uuid(),
      parentId: reqCategory.parentId,
      name: reqCategory.name,
      color: reqCategory.color,
      description: reqCategory.description,
      state: reqCategory.state,
      option: reqCategory.option,
    });
    if (category) {
      res.status(200).json({ category });
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not create category",
      error: <Error>err.message,
    });
  }
}

async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newCategory: Category = req.body;
    const category: Category | null = await Category.findOne({
      where: { id: id, state: STATE.ACTIVE },
    });
    if (!category) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    if (!newCategory.name || !newCategory.state) {
      res.status(422);
      throw new Error("Missing data body");
    }
    const categoryFound = await Category.findOne({
      where: { id: newCategory.parentId },
    });
    if (!categoryFound) {
      res.status(404);
      throw new Error("Parent id does not exist");
    }
    category.set({
      parentId: newCategory.parentId,
      name: newCategory.name,
      color: newCategory.color,
      description: newCategory.description,
      state: newCategory.state,
      option: newCategory.option,
    });
    await category.save();
    res.status(200).json({ category });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not update category",
      error: <Error>err.message,
    });
  }
}

async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const category: Category | null = await Category.findOne({
      where: { id: id, state: STATE.ACTIVE },
    });
    if (!category) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    await deleteChildCategory(category);
    res.status(200).json({
      message: "Delete successfully",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Could not delete category",
      error: <Error>err.message,
    });
  }

  async function deleteChildCategory(category: Category) {
    const listCategoryChild: Array<Category> = await Category.findAll({
      where: { parentId: category.id, state: STATE.ACTIVE },
    });
    if (listCategoryChild.length != 0) {
      for (var categoryChild of listCategoryChild) {
        await deleteChildCategory(categoryChild);
        categoryChild.set({
          state: STATE.DELETED,
        });
        await categoryChild.save();
      }
    }
    category.set({
      state: STATE.DELETED,
    });
    await category.save();
    return;
  }
}

export {
  getCategory,
  getListCategory,
  getListCategoryWithChild,
  createCategory,
  updateCategory,
  deleteCategory,
};
