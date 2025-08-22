import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";
import {
  Category,
  UpdateCategoryFields,
} from "../entities/category/Category.js";
import { CategoryName } from "../entities/category/value_objects/CategoryName.js";
import { DuplicateCategoryNameException } from "../exceptions/DuplicateCategoryNameException.js";
import { ICategoryRepository } from "../repositories/ICategoryRepository.js";

export class CategoryManager {
  async createCategory(
    categoryRepo: ICategoryRepository,
    params: {
      id: EntityId;
      accountId: EntityId;
      name: CategoryName;
    }
  ) {
    const doesNameExist = await categoryRepo.findByName(params.name);
    if (doesNameExist) {
      throw new DuplicateCategoryNameException();
    }
    const now = new Date();
    const category = Category.create({
      accountId: params.accountId,
      createdAt: now,
      deletedAt: null,
      id: params.id,
      name: params.name,
      updatedAt: now,
    });
    category.addTrackedEntity(category, EntityAction.created);
    return category;
  }

  async deleteCategory(category: Category) {
    category.delete();
  }

  async archiveCategory(category: Category) {
    category.archive();
  }

  async updateCategory(category: Category, fields: UpdateCategoryFields) {
    const now = new Date();
    if (fields.name) {
      category.setName(fields.name);
    }
    category.setUpdatedAt(now);
    category.addTrackedEntity(category, EntityAction.updated);
  }
}
