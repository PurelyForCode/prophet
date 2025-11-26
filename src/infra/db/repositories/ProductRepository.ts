import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { Product } from "../../../domain/product_management/entities/product/Product.js"
import { ProductName } from "../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductStock } from "../../../domain/product_management/entities/product/value_objects/ProductStock.js"
import { SafetyStock } from "../../../domain/product_management/entities/product/value_objects/SafetyStock.js"
import { idGenerator } from "../../utils/IdGenerator.js"
import { ProductDao, ProductDto } from "../dao/ProductDao.js"
import { ProductSettingDAO } from "../dao/ProductSettingDao.js"
import { SaleCount } from "../../../domain/product_management/entities/product/value_objects/SaleCount.js"
import { IProductRepository } from "../../../domain/product_management/repositories/IProductRepository.js"

export class ProductRepository implements IProductRepository {
	private productDao: ProductDao
	private settingDAO: ProductSettingDAO
	constructor(knex: Knex) {
		this.productDao = new ProductDao(knex)
		this.settingDAO = new ProductSettingDAO(knex)
	}

	async exists(id: EntityId): Promise<boolean> {
		return await this.productDao.exists(id)
	}

	async findAllByCategoryId(
		categoryId: EntityId,
	): Promise<Map<EntityId, Product>> {
		const result = await this.productDao.findAllByCategoryId(categoryId)
		const products = new Map()
		for (const product of result) {
			const productEntity = this.mapToEntity(product)
			products.set(productEntity.id, productEntity)
		}
		return products
	}

	async isProductNameUnique(name: ProductName): Promise<boolean> {
		return !(await this.productDao.existsByName(name.value))
	}

	async findById(id: EntityId): Promise<Product | null> {
		const product = await this.productDao.findOneById(id)
		if (!product) {
			return null
		}
		return this.mapToEntity(product)
	}

	async findByName(name: ProductName): Promise<Product | null> {
		const product = await this.productDao.findOneByName(name.value)
		if (!product) {
			return null
		}
		return this.mapToEntity(product)
	}

	async delete(entity: Product) {
		await this.productDao.delete(entity.id)
	}

	async update(entity: Product) {
		await this.productDao.update({
			id: entity.id,
			account_id: entity.accountId,
			sale_count: entity.saleCount.value,
			name: entity.name.value,
			safety_stock: entity.safetyStock.value,
			stock: entity.stock.value,
			created_at: entity.createdAt,
			updated_at: entity.updatedAt,
			deleted_at: entity.deletedAt,
			group_id: entity.productGroupId,
		})

		const productSetting = entity.settings
		await this.settingDAO.update({
			classification: productSetting.classification,
			fill_rate: productSetting.fillRate,
			product_id: entity.id,
			safety_stock_calculation_method:
				productSetting.safetyStockCalculationMethod,
			service_level: productSetting.serviceLevel,
			updated_at: productSetting.updatedAt,
		})
	}

	async create(entity: Product) {
		await this.productDao.insert({
			id: entity.id,
			account_id: entity.accountId,
			name: entity.name.value,
			sale_count: entity.saleCount.value,
			safety_stock: entity.safetyStock.value,
			stock: entity.stock.value,
			created_at: entity.createdAt,
			updated_at: entity.updatedAt,
			deleted_at: entity.deletedAt,
			group_id: entity.productGroupId,
		})
		const productSetting = entity.settings
		await this.settingDAO.insert({
			id: idGenerator.generate(),
			classification: productSetting.classification,
			fill_rate: productSetting.fillRate,
			product_id: entity.id,
			service_level: productSetting.serviceLevel,
			safety_stock_calculation_method:
				productSetting.safetyStockCalculationMethod,
			updated_at: productSetting.updatedAt,
		})
	}

	mapToEntity(product: ProductDto): Product {
		return Product.create({
			id: product.id,
			accountId: product.accountId,
			productGroupId: product.groupId,
			saleCount: new SaleCount(product.saleCount),
			name: new ProductName(product.name),
			stock: new ProductStock(product.stock),
			safetyStock: new SafetyStock(product.safetyStock),
			settings: new ProductSetting(
				product.setting.serviceLevel,
				product.setting.safetyStockCalculationMethod,
				product.setting.classification,
				product.setting.fillRate,
				product.setting.updatedAt,
			),
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			deletedAt: product.deletedAt,
		})
	}
}
