import { Knex } from "knex"
import {
	AggregateRoot,
	EntityAction,
} from "../../core/interfaces/AggregateRoot.js"
import {
	IsolationLevel,
	IUnitOfWork,
} from "../../core/interfaces/IUnitOfWork.js"
import { ICategoryRepository } from "../../domain/product_management/repositories/ICategoryRepository.js"
import { CategoryRepository } from "../db/repositories/CategoryRepository.js"
import { ISupplierRepository } from "../../domain/delivery_management/repositories/ISupplierRepository.js"
import { RepositoryFactory } from "./RepositoryFactory.js"
import { SupplierRepository } from "../db/repositories/SupplierRepository.js"
import { ISuppliedProductRepository } from "../../domain/delivery_management/repositories/ISuppliedProductRepository.js"
import { SuppliedProductRepository } from "../db/repositories/SuppliedProductRepository.js"
import { ProductRepository } from "../db/repositories/ProductRepository.js"
import { SaleRepository } from "../db/repositories/SaleRepository.js"
import { IDeliveryItemRepository } from "../../domain/delivery_management/repositories/IDeliveryItemRepository.js"
import { DeliveryItemRepository } from "../db/repositories/DeliveryItemRepository.js"
import { IDeliveryRepository } from "../../domain/delivery_management/repositories/IDeliveryRepository.js"
import { DeliveryRepository } from "../db/repositories/DeliveryRepository.js"
import { IProductGroupRepository } from "../../domain/product_management/repositories/IProductGroupRepository.js"
import { ProductGroupRepository } from "../db/repositories/ProductGroupRepository.js"
import { IForecastRepository } from "../../domain/forecasting/repositories/IForecastRepository.js"
import { ForecastRepository } from "../db/repositories/ForecastRepository.js"
import { ProphetModelRepository } from "../db/repositories/ProphetModelRepository.js"
import { IAccountRepository } from "../../domain/account_management/repositories/IAccountRepository.js"
import { AccountRepository } from "../db/repositories/AccountRepository.js"
import { IPermissionRepository } from "../../domain/account_management/repositories/IPermissionRepository.js"
import { PermissionRepository } from "../db/repositories/PermissionRepository.js"
import { IAccountPermissionRepository } from "../../domain/account_management/repositories/IAccountPermissionRepository.js"
import { AccountPermissionRepository } from "../db/repositories/AccountPermissionRepository.js"
import { IInventoryRecommendationRepository } from "../../domain/inventory_recommendation/repositories/IInventoryRecommendationRepository.js"
import { InventoryRecommendationRepository } from "../db/repositories/InventoryRecommendationRepository.js"

export class UnitOfWork implements IUnitOfWork {
	public trx: Knex.Transaction | null = null
	constructor(
		private readonly knex: Knex,
		private readonly repositoryFactory: RepositoryFactory,
	) {}
	getInventoryRecommendationRepository(): IInventoryRecommendationRepository {
		if (this.trx) {
			return new InventoryRecommendationRepository(this.trx)
		} else {
			return new InventoryRecommendationRepository(this.knex)
		}
	}

	getAccountPermissionRepository(): IAccountPermissionRepository {
		if (this.trx) {
			return new AccountPermissionRepository(this.trx)
		} else {
			return new AccountPermissionRepository(this.knex)
		}
	}

	getPermissionRepository(): IPermissionRepository {
		if (this.trx) {
			return new PermissionRepository(this.trx)
		} else {
			return new PermissionRepository(this.knex)
		}
	}

	getAccountRepository(): IAccountRepository {
		if (this.trx) {
			return new AccountRepository(this.trx)
		} else {
			return new AccountRepository(this.knex)
		}
	}

	getProphetModelRepository() {
		if (this.trx) {
			return new ProphetModelRepository(this.trx)
		} else {
			return new ProphetModelRepository(this.knex)
		}
	}

	getForecastRepository(): IForecastRepository {
		if (this.trx) {
			return new ForecastRepository(this.trx)
		} else {
			return new ForecastRepository(this.knex)
		}
	}

	getCategoryRepository(): ICategoryRepository {
		if (this.trx) {
			return new CategoryRepository(this.trx)
		} else {
			return new CategoryRepository(this.knex)
		}
	}
	getProductGroupRepository(): IProductGroupRepository {
		if (this.trx) {
			return new ProductGroupRepository(this.trx)
		} else {
			return new ProductGroupRepository(this.knex)
		}
	}

	getSupplierRepository(): ISupplierRepository {
		if (this.trx) {
			return new SupplierRepository(this.trx)
		} else {
			return new SupplierRepository(this.knex)
		}
	}
	getSuppliedProductRepository(): ISuppliedProductRepository {
		if (this.trx) {
			return new SuppliedProductRepository(this.trx)
		} else {
			return new SuppliedProductRepository(this.knex)
		}
	}

	getProductRepository() {
		if (this.trx) {
			return new ProductRepository(this.trx)
		} else {
			return new ProductRepository(this.knex)
		}
	}

	getSaleRepository() {
		if (this.trx) {
			return new SaleRepository(this.trx)
		} else {
			return new SaleRepository(this.knex)
		}
	}

	getDeliveryItemRepository(): IDeliveryItemRepository {
		if (this.trx) {
			return new DeliveryItemRepository(this.trx)
		} else {
			return new DeliveryItemRepository(this.knex)
		}
	}

	getDeliveryRepository(): IDeliveryRepository {
		if (this.trx) {
			return new DeliveryRepository(this.trx)
		} else {
			return new DeliveryRepository(this.knex)
		}
	}

	async transaction(
		config?: { isolationLevel: IsolationLevel } | undefined,
	): Promise<void> {
		if (this.trx) {
			throw new Error("Transaction already started")
		}
		const trx = await this.knex.transaction()
		this.trx = trx
	}

	async rollback(): Promise<void> {
		if (!this.trx) throw new Error("No transaction in progress")
		try {
			await this.trx.rollback()
		} finally {
			this.trx = null
		}
	}

	async commit(): Promise<void> {
		if (!this.trx) throw new Error("No transaction in progress")
		try {
			await this.trx.commit()
		} finally {
			this.trx = null
		}
	}

	async save(aggregateRoot: AggregateRoot): Promise<void> {
		if (!this.trx) {
			throw new Error(
				"Transaction not initialized. call transaction() first.",
			)
		}
		const trackedEntities = aggregateRoot.getTrackedEntities()
		const values = trackedEntities.values()
		for (const trackedEntity of values) {
			const entity = trackedEntity.entity
			const action = trackedEntity.action
			const repo = this.repositoryFactory.getRepoOfEntity(
				entity.constructor,
				this.trx,
			)
			if (action === EntityAction.created) {
				await repo.create(entity)
			} else if (action === EntityAction.deleted) {
				await repo.delete(entity)
			} else if (action === EntityAction.updated) {
				await repo.update(entity)
			}
		}
		aggregateRoot.clearTrackedEntities()
	}
}

export async function runInTransaction<T>(
	uow: IUnitOfWork,
	isolationLevel: IsolationLevel,
	fn: () => Promise<T>,
) {
	try {
		await uow.transaction({ isolationLevel })
		const result = await fn()
		await uow.commit()
		return result
	} catch (error) {
		try {
			await uow.rollback()
		} catch {
			console.log(error)
		}
		throw error
	}
}
