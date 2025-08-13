import { Repository } from "../../../core/interfaces/Repository.js";
import { SuppliedProduct } from "../entities/supplied_product/SuppliedProduct.js";

export interface ISuppliedProductRepository
  extends Repository<SuppliedProduct> {}
