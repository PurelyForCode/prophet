import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Sale, SaleUpdateableFields } from "../entities/sale/Sale.js"
import { SaleQuantity } from "../entities/sale/value_objects/SaleQuantity.js"
import { SaleStatus } from "../entities/sale/value_objects/SaleStatus.js"

export class SaleService {
	createSale(params: {
		id: EntityId
		accountId: EntityId
		productId: EntityId
		quantity: SaleQuantity
		status: SaleStatus
		date: Date
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
	}) {
		const sale = Sale.create(params)
		sale.addTrackedEntity(sale, EntityAction.created)
		return sale
	}

	updateSale(input: SaleUpdateableFields, sale: Sale) {
		sale.throwIfArchived()
		if (input.date) {
			sale.setDate(input.date)
		}
		if (input.quantity) {
			sale.setQuantity(input.quantity)
		}
		if (input.status) {
			sale.setStatus(input.status)
		}
		sale.setUpdatedAt(new Date())
		sale.addTrackedEntity(sale, EntityAction.updated)
	}

	deleteSale(sale: Sale) {
		sale.delete()
	}

	archiveSale(sale: Sale) {
		sale.archive()
	}
}
