import { AggregateRoot } from "./AggregateRoot.js";
import { IProductRepository } from "../../domain/product_management/repositories/IProductRepository.js";
import { ISaleRepository } from "../../domain/sales/repositories/ISaleRepository.js";

export enum IsolationLevel {
  READ_COMMITTED = "READ COMMITTED",
  REPEATABLE_READ = "REPEATABLE READ",
  SERIALIZABLE = "SERIALIZABLE",
}

export interface IUnitOfWork {
  getProductRepository(): IProductRepository;
  getSaleRepository(): ISaleRepository;
  transaction(
    config?: { isolationLevel: IsolationLevel } | undefined
  ): Promise<void>;
  rollback(): Promise<void>;
  commit(): Promise<void>;
  save(aggregateRoot: AggregateRoot): Promise<void>;
}
