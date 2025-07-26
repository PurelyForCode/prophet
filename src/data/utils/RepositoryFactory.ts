import { Knex } from "knex";
import { Repository } from "../../core/interfaces/Repository.js";
import { Product } from "../../domain/product_management/entities/product/Product.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { VariantRepository } from "../repositories/VariantRepository.js";
import { Variant } from "../../domain/product_management/entities/variant/Variant.js";

type RepositoryConstructor<T> = new (
  knex: Knex | Knex.Transaction
) => Repository<T>;

export class RepositoryFactory {
  private repositoryRegistry = new Map<Function, Function>();

  constructor() {
    this.register(Product, ProductRepository);
    this.register(Variant, VariantRepository);
  }

  private register<T>(entity: Function, repositoryConstructor: Function) {
    this.repositoryRegistry.set(entity, repositoryConstructor);
  }

  getRepoOfEntity<T>(
    entityConstructor: Function,
    knex: Knex | Knex.Transaction
  ): Repository<T> {
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
