import { AggregateRoot } from "./AggregateRoot.js"
import { IProductRepository } from "../../domain/product_management/repositories/IProductRepository.js"
import { ISaleRepository } from "../../domain/sales/repositories/ISaleRepository.js"
import { IDeliveryItemRepository } from "../../domain/delivery_management/repositories/IDeliveryItemRepository.js"
import { IDeliveryRepository } from "../../domain/delivery_management/repositories/IDeliveryRepository.js"
import { ISupplierRepository } from "../../domain/delivery_management/repositories/ISupplierRepository.js"
import { ISuppliedProductRepository } from "../../domain/delivery_management/repositories/ISuppliedProductRepository.js"
import { ICategoryRepository } from "../../domain/product_management/repositories/ICategoryRepository.js"
import { IProductGroupRepository } from "../../domain/product_management/repositories/IProductGroupRepository.js"
import { IForecastRepository } from "../../domain/forecasting/repositories/IForecastRepository.js"
import { Knex } from "knex"
import { IProphetModelRepository } from "../../domain/forecasting/repositories/IProphetModelRepository.js"
import { IAccountRepository } from "../../domain/account_management/repositories/IAccountRepository.js"
import { IPermissionRepository } from "../../domain/account_management/repositories/IPermissionRepository.js"
import { IAccountPermissionRepository } from "../../domain/account_management/repositories/IAccountPermissionRepository.js"
import { IInventoryRecommendationRepository } from "../../domain/inventory_recommendation/repositories/IInventoryRecommendationRepository.js"

export enum IsolationLevel {
	READ_COMMITTED = "READ COMMITTED",
	REPEATABLE_READ = "REPEATABLE READ",
	SERIALIZABLE = "SERIALIZABLE",
}

export interface IUnitOfWork {
	trx: Knex.Transaction | null

	getProductRepository(): IProductRepository
	getCategoryRepository(): ICategoryRepository
	getSaleRepository(): ISaleRepository
	getDeliveryItemRepository(): IDeliveryItemRepository
	getDeliveryRepository(): IDeliveryRepository
	getSupplierRepository(): ISupplierRepository
	getSuppliedProductRepository(): ISuppliedProductRepository
	getProductGroupRepository(): IProductGroupRepository
	getForecastRepository(): IForecastRepository
	getProphetModelRepository(): IProphetModelRepository
	getAccountRepository(): IAccountRepository
	getPermissionRepository(): IPermissionRepository
	getAccountPermissionRepository(): IAccountPermissionRepository
	getInventoryRecommendationRepository(): IInventoryRecommendationRepository

	transaction(
		config?: { isolationLevel: IsolationLevel } | undefined,
	): Promise<void>
	rollback(): Promise<void>
	commit(): Promise<void>
	save(aggregateRoot: AggregateRoot): Promise<void>
}
