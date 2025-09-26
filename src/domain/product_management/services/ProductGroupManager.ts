import { EntityAction } from "../../../core/interfaces/AggregateRoot.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { Product } from "../entities/product/Product.js";
import { ProductName } from "../entities/product/value_objects/ProductName.js";
import { ProductSetting } from "../entities/product/value_objects/ProductSetting.js";
import { ProductStock } from "../entities/product/value_objects/ProductStock.js";
import { SafetyStock } from "../entities/product/value_objects/SafetyStock.js";
import { ProductGroup, UpdateProductGroupFields } from "../entities/product_group/ProductGroup.js";
import { DuplicateProductNameException } from "../exceptions/DuplicateNameException.js";
import { IProductRepository } from "../repositories/IProductRepository.js";

class ProductGroupManager {
	async createProductGroup(
		productRepo: IProductRepository,
		input: {
			productGroupId: EntityId;
			productId: EntityId;
			accountId: EntityId;
			productCategoryId: EntityId | null;
			productGroupName: ProductName;
			settings: ProductSetting | undefined;
			now: Date;
		}
	) {
		const isNameUnique = await productRepo.isProductNameUnique(input.productGroupName);
		if (!isNameUnique) {
			throw new DuplicateProductNameException();
		}
		const productGroup = ProductGroup.create(
			{
				id: input.productGroupId,
				categoryId: input.productCategoryId,
				accountId: input.accountId,
				createdAt: input.now,
				deletedAt: null,
				name: input.productGroupName,
				updatedAt: input.now,
				products: new Map()
			}
		)
		productGroup.addVariant(
			input.productId,
			input.accountId,
			ProductName.base(),
			new ProductStock(0),
			ProductSetting.defaultConfiguration(new Date())
		)
		productGroup.addTrackedEntity(productGroup, EntityAction.created)
		return productGroup

	}

	archiveProductGroup(productGroup: ProductGroup) {
		productGroup.archive()
	}

	deleteProductGroup(productGroup: ProductGroup) {
		productGroup.delete();
	}

	async updateProductGroup(
		productRepo: IProductRepository,
		product: Product,
		updatedAt: Date,
		fields: UpdateProductGroupFields
	) {
		if (product.getDeletedAt()) {
			throw new ProductIsAlreadyArchived();
		}
		if (fields.name) {
			const isNameUnique = await productRepo.isProductNameUnique(fields.name);
			if (!isNameUnique) {
				throw new DuplicateProductNameException();
			}
			product.setName(fields.name);
		}
		fields.stock && product.setStock(fields.stock);
		fields.safetyStock && product.setSafetyStock(fields.safetyStock);
		fields.settings && product.updateSetting(fields.settings);
		product.setUpdatedAt(updatedAt);
		product.addTrackedEntity(product, EntityAction.updated);
	}
}

