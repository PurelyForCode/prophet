import { Knex } from "knex";
import { IRepository } from "../../core/interfaces/Repository.js";
import { Product } from "../../domain/product_management/entities/product/Product.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { VariantRepository } from "../repositories/VariantRepository.js";
import { Variant } from "../../domain/product_management/entities/variant/Variant.js";
import { SaleRepository } from "../repositories/SaleRepository.js";
import { Sale } from "../../domain/sales/entities/sale/Sale.js";
import { DeliveryRepository } from "../repositories/DeliveryRepository.js";
import { Delivery } from "../../domain/delivery_management/entities/delivery/Delivery.js";
import { DeliveryItem } from "../../domain/delivery_management/entities/delivery_item/DeliveryItem.js";
import { DeliveryItemRepository } from "../repositories/DeliveryItemRepository.js";
import { SupplierRepository } from "../repositories/SupplierRepository.js";
import { Supplier } from "../../domain/delivery_management/entities/supplier/Supplier.js";
import { CategoryRepository } from "../repositories/CategoryRepository.js";
import { Category } from "../../domain/product_management/entities/category/Category.js";
import { SuppliedProduct } from "../../domain/delivery_management/entities/supplied_product/SuppliedProduct.js";
import { SuppliedProductRepository } from "../repositories/SuppliedProductRepository.js";

type RepositoryConstructor<T> = new (
  knex: Knex | Knex.Transaction
) => IRepository<T>;

export class RepositoryFactory {
  private repositoryRegistry = new Map<Function, Function>();

  constructor() {
    this.register(Product, ProductRepository);
    this.register(Variant, VariantRepository);
    this.register(Sale, SaleRepository);
    this.register(Delivery, DeliveryRepository);
    this.register(DeliveryItem, DeliveryItemRepository);
    this.register(Supplier, SupplierRepository);
    this.register(SuppliedProduct, SuppliedProductRepository);
    this.register(Category, CategoryRepository);
  }

  private register<T>(entity: Function, repositoryConstructor: Function) {
    this.repositoryRegistry.set(entity, repositoryConstructor);
  }

  getRepoOfEntity<T>(
    entityConstructor: Function,
    knex: Knex | Knex.Transaction
  ): IRepository<T> {
    const repoConstructor = this.repositoryRegistry.get(entityConstructor) as
      | RepositoryConstructor<T>
      | undefined;

    if (!repoConstructor) {
      throw new Error("No repository registered for entity");
    }

    return new repoConstructor(knex);
  }
}

export const repositoryFactory = new RepositoryFactory();
