import { Knex } from "knex"
import { IRepository } from "../../core/interfaces/Repository.js"
import { Product } from "../../domain/product_management/entities/product/Product.js"
import { ProductRepository } from "../db/repositories/ProductRepository.js"
import { SaleRepository } from "../db/repositories/SaleRepository.js"
import { Sale } from "../../domain/sales/entities/sale/Sale.js"
import { DeliveryRepository } from "../db/repositories/DeliveryRepository.js"
import { Delivery } from "../../domain/delivery_management/entities/delivery/Delivery.js"
import { DeliveryItem } from "../../domain/delivery_management/entities/delivery_item/DeliveryItem.js"
import { DeliveryItemRepository } from "../db/repositories/DeliveryItemRepository.js"
import { SupplierRepository } from "../db/repositories/SupplierRepository.js"
import { Supplier } from "../../domain/delivery_management/entities/supplier/Supplier.js"
import { CategoryRepository } from "../db/repositories/CategoryRepository.js"
import { Category } from "../../domain/product_management/entities/category/Category.js"
import { SuppliedProduct } from "../../domain/delivery_management/entities/supplied_product/SuppliedProduct.js"
import { SuppliedProductRepository } from "../db/repositories/SuppliedProductRepository.js"
import { ProductGroupRepository } from "../db/repositories/ProductGroupRepository.js"
import { ProductGroup } from "../../domain/product_management/entities/product_group/ProductGroup.js"
import { InventoryRecommendation } from "../../domain/inventory_recommendation/entities/inventory_recommendation/InventoryRecommendation.js"
import { InventoryRecommendationRepository } from "../db/repositories/InventoryRecommendationRepository.js"
import { ProphetModel } from "../../domain/forecasting/entities/prophet_model/ProphetModel.js"
import { ProphetModelRepository } from "../db/repositories/ProphetModelRepository.js"
import { Account } from "../../domain/account_management/entities/account/Account.js"
import { AccountRepository } from "../db/repositories/AccountRepository.js"
import { AccountPermission } from "../../domain/account_management/entities/account/value_objects/AccountPermission.js"
import { AccountPermissionRepository } from "../db/repositories/AccountPermissionRepository.js"
import { Forecast } from "../../domain/forecasting/entities/forecast/Forecast.js"
import { ForecastRepository } from "../db/repositories/ForecastRepository.js"

type RepositoryConstructor<T> = new (
	knex: Knex | Knex.Transaction,
) => IRepository<T>

export class RepositoryFactory {
	private repositoryRegistry = new Map<Function, Function>()

	constructor() {
		this.register(Product, ProductRepository)
		this.register(Sale, SaleRepository)
		this.register(Delivery, DeliveryRepository)
		this.register(DeliveryItem, DeliveryItemRepository)
		this.register(Supplier, SupplierRepository)
		this.register(SuppliedProduct, SuppliedProductRepository)
		this.register(Category, CategoryRepository)
		this.register(ProductGroup, ProductGroupRepository)
		this.register(
			InventoryRecommendation,
			InventoryRecommendationRepository,
		)
		this.register(Forecast, ForecastRepository)
		this.register(ProphetModel, ProphetModelRepository)
		this.register(Account, AccountRepository)
		this.register(AccountPermission, AccountPermissionRepository)
	}

	private register<T>(entity: Function, repositoryConstructor: Function) {
		this.repositoryRegistry.set(entity, repositoryConstructor)
	}

	getRepoOfEntity<T>(
		entityConstructor: Function,
		knex: Knex | Knex.Transaction,
	): IRepository<T> {
		const repoConstructor = this.repositoryRegistry.get(
			entityConstructor,
		) as RepositoryConstructor<T> | undefined

		if (!repoConstructor) {
			throw new Error("No repository registered for entity")
		}

		return new repoConstructor(knex)
	}
}

export const repositoryFactory = new RepositoryFactory()
