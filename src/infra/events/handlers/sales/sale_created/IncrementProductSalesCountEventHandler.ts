import { DomainEventHandler } from "../../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../../core/interfaces/IUnitOfWork.js"
import { SaleCount } from "../../../../../domain/product_management/entities/product/value_objects/SaleCount.js"
import { FirstSaleCreatedForDate } from "../../../../../domain/sales/events/SaleCreatedEvent.js"
import { SALE_EVENTS } from "../../../../../domain/sales/events/SaleEventList.js"

export class IncrementProductSalesCountHandler implements DomainEventHandler {
	eventName = SALE_EVENTS.FIRST_SALE_CREATED_FOR_DATE
	async handle(
		event: FirstSaleCreatedForDate,
		uow: IUnitOfWork,
	): Promise<void> {
		const productRepo = uow.getProductRepository()
		const product = await productRepo.findById(event.payload.productId)
		if (!product) {
			console.warn(
				`[IncrementProductSalesCountEventHandler] Product not found: ${event.payload.productId}`,
			)
			return
		}
		product.saleCount = new SaleCount(product.saleCount.value + 1)
		await productRepo.update(product)
		return
	}
}
