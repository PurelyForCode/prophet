import { AggregateRoot } from "./AggregateRoot.js";
import { IProductRepository } from "../../domain/product_management/repositories/IProductRepository.js";
import { ISaleRepository } from "../../domain/sales/repositories/ISaleRepository.js";
import { IDeliveryItemRepository } from "../../domain/delivery_management/repositories/IDeliveryItemRepository.js";
import { IDeliveryRepository } from "../../domain/delivery_management/repositories/IDeliveryRepository.js";
import { ISupplierRepository } from "../../domain/delivery_management/repositories/ISupplierRepository.js";
import { ISuppliedProductRepository } from "../../domain/delivery_management/repositories/ISuppliedProductRepository.js";
import { ICategoryRepository } from "../../domain/product_management/repositories/ICategoryRepository.js";

export enum IsolationLevel {
  READ_COMMITTED = "READ COMMITTED",
  REPEATABLE_READ = "REPEATABLE READ",
  SERIALIZABLE = "SERIALIZABLE",
}

export interface IUnitOfWork {
  getProductRepository(): IProductRepository;
  getCategoryRepository(): ICategoryRepository;
  getSaleRepository(): ISaleRepository;
  getDeliveryItemRepository(): IDeliveryItemRepository;
  getDeliveryRepository(): IDeliveryRepository;
  getSupplierRepository(): ISupplierRepository;
  getSuppliedProductRepository(): ISuppliedProductRepository;

  transaction(
    config?: { isolationLevel: IsolationLevel } | undefined
  ): Promise<void>;
  rollback(): Promise<void>;
  commit(): Promise<void>;
  save(aggregateRoot: AggregateRoot): Promise<void>;
}
