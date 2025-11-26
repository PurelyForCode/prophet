import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { SuppliedProduct } from "../entities/supplied_product/SuppliedProduct.js"
import { Supplier } from "../entities/supplier/Supplier.js"

export interface ISuppliedProductRepository
	extends IRepository<SuppliedProduct> {
	doesProductHaveDefaultSupplier(productId: EntityId): Promise<boolean>
	isProductSupplied(
		productId: EntityId,
		supplierId: EntityId,
	): Promise<boolean>
}
