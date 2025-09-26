
import { IRepository } from "../../../core/interfaces/Repository.js";
import { EntityId } from "../../../core/types/EntityId.js";
import { EntityCollection } from "../../../core/types/EntityCollection.js";
import { ProductGroup } from "../entities/product_group/ProductGroup.js";
import { ProductName } from "../entities/product/value_objects/ProductName.js";

export interface IProductGroupRepository extends IRepository<ProductGroup> {
	findById(id: EntityId): Promise<ProductGroup | null>;
	findByName(name: ProductName): Promise<ProductGroup | null>;
	isNameUnique(name: ProductName): Promise<boolean>;
}
