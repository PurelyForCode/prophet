import { IRepository } from "../../../core/interfaces/Repository.js";
import { Category } from "../entities/category/Category.js";

export interface ICategoryRepository extends IRepository<Category> {}
