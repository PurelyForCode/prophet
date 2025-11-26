import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductName } from "../entities/product/value_objects/ProductName.js"
import { ProductSetting } from "../entities/product/value_objects/ProductSetting.js"
import { ProductStock } from "../entities/product/value_objects/ProductStock.js"
import {
	ProductGroup,
	UpdateProductGroupFields,
} from "../entities/product_group/ProductGroup.js"
import { DuplicateProductNameException } from "../exceptions/DuplicateNameException.js"
import { DuplicateProductGroupNameException } from "../exceptions/DuplicateProductGroupNameException.js"
import { IProductGroupRepository } from "../repositories/IProductGroupRepository.js"

export class ProductGroupManager {
	async createProductGroup(
		groupRepo: IProductGroupRepository,
		input: {
			productGroupId: EntityId
			productId: EntityId
			accountId: EntityId
			productCategoryId: EntityId | null
			productGroupName: ProductName
			settings: ProductSetting | undefined
			now: Date
		},
	) {
		const isNameUnique = await groupRepo.isNameUnique(
			input.productGroupName,
			undefined,
		)
		if (!isNameUnique) {
			throw new DuplicateProductNameException()
		}
		const group = ProductGroup.create({
			id: input.productGroupId,
			categoryId: input.productCategoryId,
			accountId: input.accountId,
			createdAt: input.now,
			deletedAt: null,
			name: input.productGroupName,
			updatedAt: input.now,
			products: new Map(),
		})
		group.addTrackedEntity(group, EntityAction.created)
		group.addVariant(
			input.productId,
			input.accountId,
			ProductName.base(),
			new ProductStock(0),
			ProductSetting.defaultConfiguration(new Date()),
		)
		return group
	}

	archiveProductGroup(group: ProductGroup) {
		group.archive()
		return group
	}

	deleteProductGroup(group: ProductGroup) {
		group.delete()
		return group
	}

	async updateProductGroup(
		groupRepo: IProductGroupRepository,
		fields: UpdateProductGroupFields,
		group: ProductGroup,
	) {
		if (fields.name) {
			if (!(await groupRepo.isNameUnique(fields.name, false))) {
				throw new DuplicateProductGroupNameException()
			}
			group.name = fields.name
		}
		group.addTrackedEntity(group, EntityAction.updated)
		return group
	}
}
