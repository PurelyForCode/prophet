import { DomainEventHandler } from "../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { SALE_EVENTS } from "../../sales/events/SaleEventList.js"
import { SaleQuantityDecremented } from "../../sales/events/SaleQuantityDecremented.js"
import { ProductStock } from "../entities/product/value_objects/ProductStock.js"

export class DecrementProductStockHandler implements DomainEventHandler {
	eventName = SALE_EVENTS.QUANTITY_INCREMENTED
	async handle(
		event: SaleQuantityDecremented,
		uow: IUnitOfWork,
	): Promise<void> {
		const payload = event.payload
		const productRepo = uow.getProductRepository()
		const product = await productRepo.findById(payload.productId)
		if (product) {
			const newValue = Math.max(0, product.stock.value - payload.amount)
			product.stock = new ProductStock(newValue)
			await productRepo.update(product)
		}
	}
}
