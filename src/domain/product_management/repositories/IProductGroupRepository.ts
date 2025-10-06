import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductGroup } from "../entities/product_group/ProductGroup.js"
import { ProductName } from "../entities/product/value_objects/ProductName.js"

export interface IProductGroupRepository extends IRepository<ProductGroup> {
	findById(id: EntityId): Promise<ProductGroup | null>
	findByName(name: ProductName): Promise<ProductGroup | null>
	findByCategoryId(categoryId: EntityId): Promise<Map<EntityId, ProductGroup>>
	isNameUnique(
		name: ProductName,
		archived: boolean | undefined,
	): Promise<boolean>
	exists(id: EntityId): Promise<boolean>
}
