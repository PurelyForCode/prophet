import { IRepository } from "../../../core/interfaces/Repository.js";
import { SuppliedProduct } from "../entities/supplied_product/SuppliedProduct.js";

export interface ISuppliedProductRepository
  extends IRepository<SuppliedProduct> {}
