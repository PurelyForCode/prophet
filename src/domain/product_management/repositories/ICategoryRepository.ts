import { IRepository } from "../../../core/interfaces/Repository.js";
import { Category } from "../entities/category/Category.js";
import { CategoryName } from "../entities/category/value_objects/CategoryName.js";

export interface ICategoryRepository extends IRepository<Category> {
  findByName(name: CategoryName): Promise<null | Category>;
}
