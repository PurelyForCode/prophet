import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Sale, SaleUpdateableFields } from "../entities/sale/Sale.js"
import { SaleQuantity } from "../entities/sale/value_objects/SaleQuantity.js"
import { SaleStatus } from "../entities/sale/value_objects/SaleStatus.js"
import { FirstSaleCreatedForDate } from "../events/SaleCreatedEvent.js"
import { SaleQuantityDecremented } from "../events/SaleQuantityDecremented.js"
import { SaleQuantityIncremented } from "../events/SaleQuantityIncremented.js"
import { ISaleRepository } from "../repositories/ISaleRepository.js"

export class SaleService {
	async createSale(
		saleRepo: ISaleRepository,
		params: {
			id: EntityId
			accountId: EntityId
			productId: EntityId
			quantity: SaleQuantity
			status: SaleStatus
			date: Date
			createdAt: Date
			updatedAt: Date
			deletedAt: Date | null
		},
	) {
		const sale = Sale.create(params)
		sale.addTrackedEntity(sale, EntityAction.created)
		if (!(await saleRepo.doesSaleExistInDate(sale.getDate()))) {
			sale.addDomainEvent(
				new FirstSaleCreatedForDate(sale.getProductId(), sale.id),
			)
		}
		if (sale.getStatus().value === "completed") {
			sale.addDomainEvent(
				new SaleQuantityIncremented(
					sale.getProductId(),
					sale.getQuantity().value,
				),
			)
		}
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
		sale.archive()
		sale.delete()
	}

	archiveSale(sale: Sale) {
		sale.archive()
		sale.addDomainEvent(
			new SaleQuantityDecremented(
				sale.getProductId(),
				sale.getQuantity().value,
			),
		)
	}
}
