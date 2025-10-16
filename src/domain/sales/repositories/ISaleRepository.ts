import { IRepository } from "../../../core/interfaces/Repository.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Sale } from "../entities/sale/Sale.js"

export interface ISaleRepository extends IRepository<Sale> {
	findProductSales(productId: EntityId, days: number): Promise<Sale>
}
