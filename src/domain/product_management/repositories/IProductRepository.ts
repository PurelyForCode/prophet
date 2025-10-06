import { Product } from "../entities/product/Product.js"
import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { ProductName } from "../entities/product/value_objects/ProductName.js"
import { EntityCollection } from "../../../core/types/EntityCollection.js"

export interface IProductRepository extends IRepository<Product> {
	findById(id: EntityId): Promise<Product | null>
	findByName(name: ProductName): Promise<Product | null>
	findAllByCategoryId(
		categoryId: EntityId,
	): Promise<EntityCollection<Product>>
	isProductNameUnique(name: ProductName): Promise<boolean>
	exists(id: EntityId): Promise<boolean>
}
