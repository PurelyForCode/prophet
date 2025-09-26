import { Knex } from "knex";
import { EntityId } from "../../../core/types/EntityId.js";
import { IProductRepository } from "../../../domain/product_management/repositories/IProductRepository.js";
import { Product } from "../../../domain/product_management/entities/product/Product.js";
import { ProductName } from "../../../domain/product_management/entities/product/value_objects/ProductName.js";
import { ProductSetting } from "../../../domain/product_management/entities/product/value_objects/ProductSetting.js";
import { ProductStock } from "../../../domain/product_management/entities/product/value_objects/ProductStock.js";
import { SafetyStock } from "../../../domain/product_management/entities/product/value_objects/SafetyStock.js";
import { Variant } from "../../../domain/product_management/entities/variant/Variant.js";
import { idGenerator } from "../../utils/IdGenerator.js";
import { ProductDAO, ProductDTO } from "../dao/ProductDao.js";
import { ProductSettingDAO } from "../dao/ProductSettingDao.js";

export class ProductRepository implements IProductRepository {
	private productDAO: ProductDAO;
	private settingDAO: ProductSettingDAO;
	constructor(knex: Knex.Transaction | Knex) {
		this.productDAO = new ProductDAO(knex);
		this.settingDAO = new ProductSettingDAO(knex);
	}

	async findAllByCategoryId(
		categoryId: EntityId
	): Promise<Map<EntityId, Product>> {
		const result = await this.productDAO.findAllByCategoryId(categoryId);
		const products = new Map();
		for (const product of result) {
			const productEntity = this.mapToEntity(product, variants);
			products.set(productEntity.id, productEntity);
		}
		return products;
	}

	async isProductNameUnique(name: ProductName): Promise<boolean> {
		return !(await this.productDAO.existsByName(name.value));
	}

	async findById(id: EntityId): Promise<Product | null> {
		const product = await this.productDAO.findOneById(id);
		if (!product) {
			return null;
		}
		const variants = await this.variantRepo.findAllByProductId(product.id);
		return this.mapToEntity(product, variants);
	}

	async findByName(name: ProductName): Promise<Product | null> {
		const product = await this.productDAO.findOneByName(name.value);
		if (!product) {
			return null;
		}
		const variants = await this.variantRepo.findAllByProductId(product.id);
		return this.mapToEntity(product, variants);
	}

	async delete(entity: Product) {
		await this.productDAO.delete(entity.id);
	}

	async update(entity: Product) {
		await this.productDAO.update({
			id: entity.id,
			account_id: entity.getAccountId(),
			name: entity.getName().value,
			product_category_id: entity.getProductCategoryId(),
			safety_stock: entity.getSafetyStock().value,
			stock: entity.getStock().value,
			created_at: entity.getCreatedAt(),
			updated_at: entity.getUpdatedAt(),
			product_id: null,
			deleted_at: entity.getDeletedAt(),
		});

		const productSetting = entity.getSetting();
		await this.settingDAO.update({
			classification: productSetting.classification,
			fill_rate: productSetting.fillRate,
			product_id: entity.id,
			safety_stock_calculation_method:
				productSetting.safetyStockCalculationMethod,
			service_level: productSetting.serviceLevel,
			updated_at: productSetting.updatedAt,
		});
	}

	async create(entity: Product) {
		await this.productDAO.insert({
			id: entity.id,
			account_id: entity.getAccountId(),
			name: entity.getName().value,
			product_category_id: entity.getProductCategoryId(),
			safety_stock: entity.getSafetyStock().value,
			stock: entity.getStock().value,
			created_at: entity.getCreatedAt(),
			updated_at: entity.getUpdatedAt(),
			product_id: null,
			deleted_at: entity.getDeletedAt(),
		});
		const productSetting = entity.getSetting();
		await this.settingDAO.insert({
			id: idGenerator.generate(),
			classification: productSetting.classification,
			fill_rate: productSetting.fillRate,
			product_id: entity.id,
			service_level: productSetting.serviceLevel,
			safety_stock_calculation_method:
				productSetting.safetyStockCalculationMethod,
			updated_at: productSetting.updatedAt,
		});
	}

	mapToEntity(product: ProductDTO, variants: Map<EntityId, Variant>): Product {
		return Product.create({
			id: product.id,
			accountId: product.accountId,
			productCategoryId: product.productCategoryId,
			name: new ProductName(product.name),
			stock: new ProductStock(product.stock),
			safetyStock: new SafetyStock(product.safetyStock),
			settings: new ProductSetting(
				product.setting.serviceLevel,
				product.setting.safetyStockCalculationMethod,
				product.setting.classification,
				product.setting.fillRate,
				product.setting.updatedAt
			),
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			deletedAt: product.deletedAt,
			variants: variants,
		});
	}
}
