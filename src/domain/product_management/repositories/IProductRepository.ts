import { Product } from "../entities/product/Product.js";
import { Repository } from "../../../core/interfaces/Repository.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { ProductName } from "../entities/product/value_objects/ProductName.js";

export interface IProductRepository extends Repository<Product> {
  findById(id: EntityId): Promise<Product | null>;
  findByName(name: ProductName): Promise<Product | null>;
  isProductNameUnique(name: ProductName): Promise<boolean>;

  // queryById(
  //   id: EntityId,
  //   filters: ProductQueryFilters | undefined,
  //   include: ProductIncludeParams | undefined
  // ): Promise<ProductReadModel | null>;
  // queryAll(
  //   filters: ProductQueryFilters | undefined,
  //   include: ProductIncludeParams | undefined
  // ): Promise<ProductReadModel[]>;
}
