import { Knex } from "knex"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductName } from "../../../domain/product_management/entities/product/value_objects/ProductName.js"
import { ProductGroup } from "../../../domain/product_management/entities/product_group/ProductGroup.js"
import { IProductGroupRepository } from "../../../domain/product_management/repositories/IProductGroupRepository.js"
import { ProductGroupDao, ProductGroupDto } from "../dao/ProductGroupDao.js"
import { ProductDao, ProductDto } from "../dao/ProductDao.js"
import { Product } from "../../../domain/product_management/entities/product/Product.js"
import { SafetyStock } from "../../../domain/product_management/entities/product/value_objects/SafetyStock.js"
import { ProductSetting } from "../../../domain/product_management/entities/product/value_objects/ProductSetting.js"
import { ProductStock } from "../../../domain/product_management/entities/product/value_objects/ProductStock.js"
import { SaleCount } from "../../../domain/product_management/entities/product/value_objects/SaleCount.js"

export class ProductGroupRepository implements IProductGroupRepository {
	private productGroupDao: ProductGroupDao
	private productDao: ProductDao

	constructor(knex: Knex) {
		this.productGroupDao = new ProductGroupDao(knex)
		this.productDao = new ProductDao(knex)
	}

	async exists(id: EntityId): Promise<boolean> {
		return await this.productGroupDao.exists(id)
	}

	async create(entity: ProductGroup): Promise<void> {
		await this.productGroupDao.insert({
			created_at: entity.createdAt,
			account_id: entity.accountId,
			deleted_at: entity.deletedAt,
			id: entity.id,
			name: entity.name.value,
			product_category_id: entity.categoryId,
			updated_at: entity.updatedAt,
		})
	}
	async update(entity: ProductGroup): Promise<void> {
		await this.productGroupDao.update({
			created_at: entity.createdAt,
			account_id: entity.accountId,
			deleted_at: entity.deletedAt,
			id: entity.id,
			name: entity.name.value,
			product_category_id: entity.categoryId,
			updated_at: entity.updatedAt,
		})
	}
	async delete(entity: ProductGroup): Promise<void> {
		await this.productGroupDao.delete({
			created_at: entity.createdAt,
			account_id: entity.accountId,
			deleted_at: entity.deletedAt,
			id: entity.id,
			name: entity.name.value,
			product_category_id: entity.categoryId,
			updated_at: entity.updatedAt,
		})
	}
	async findById(id: EntityId): Promise<ProductGroup | null> {
		const productGroupDto = await this.productGroupDao.findById(id)
		if (!productGroupDto) {
			return null
		}
		const products = await this.productDao.findAllByGroupId(id)
		const productGroup = this.mapToEntity(productGroupDto, products)
		return productGroup
	}
	async findByCategoryId(
		categoryId: EntityId,
	): Promise<Map<EntityId, ProductGroup>> {
		const productGroupDto =
			await this.productGroupDao.findByCategoryId(categoryId)
		if (!productGroupDto) {
			return new Map()
		}
		let groups = new Map<EntityId, ProductGroup>()
		for (const group of productGroupDto.values()) {
			const products = await this.productDao.findAllByGroupId(group.id)
			const productGroup = this.mapToEntity(group, products)
			groups.set(productGroup.id, productGroup)
		}
		return groups
	}

	async findByName(name: ProductName): Promise<ProductGroup | null> {
		const productGroupDto = await this.productGroupDao.findByName(name)
		if (!productGroupDto) {
			return null
		}
		const products = await this.productDao.findAllByGroupId(
			productGroupDto.id,
		)
		const productGroup = this.mapToEntity(productGroupDto, products)
		return productGroup
	}
	async isNameUnique(
		name: ProductName,
		archived: boolean | undefined,
	): Promise<boolean> {
		return await this.productGroupDao.isNameUnique(name, archived)
	}

	private mapToEntity(
		group: ProductGroupDto,
		products: ProductDto[],
	): ProductGroup {
		const productEntities: Map<EntityId, Product> = new Map()
		for (const product of products) {
			const productEntity = Product.create({
				id: product.id,
				accountId: product.accountId,
				createdAt: product.createdAt,
				deletedAt: product.deletedAt,
				name: new ProductName(product.name),
				saleCount: new SaleCount(product.saleCount),
				productGroupId: product.groupId,
				safetyStock: new SafetyStock(product.safetyStock),
				settings: new ProductSetting(
					product.setting.serviceLevel,
					product.setting.safetyStockCalculationMethod,
					product.setting.classification,
					product.setting.fillRate,
					product.setting.updatedAt,
				),
				stock: new ProductStock(product.stock),
				updatedAt: product.updatedAt,
			})
			productEntities.set(productEntity.id, productEntity)
		}

		return ProductGroup.create({
			id: group.id,
			categoryId: group.productCategoryId,
			accountId: group.accountId,
			createdAt: group.createdAt,
			deletedAt: group.deletedAt,
			name: new ProductName(group.name),
			updatedAt: group.updatedAt,
			products: productEntities,
		})
	}
}
