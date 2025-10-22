import { DomainEventHandler } from "../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../core/interfaces/IUnitOfWork.js"
import { DeliveryCompletedEvent } from "../../delivery_management/events/DeliveryCompletedEvent.js"
import { DeliveryEvents } from "../../delivery_management/events/DeliveryManagementDomainEventList.js"
import { DeliveryNotFoundException } from "../../delivery_management/exceptions/DeliveryNotFoundException.js"
import { ProductStock } from "../entities/product/value_objects/ProductStock.js"

export class DeliveryCompletedHandler implements DomainEventHandler {
	eventName = DeliveryEvents.DELIVERY_COMPLETED
	async handle(
		event: DeliveryCompletedEvent,
		uow: IUnitOfWork,
	): Promise<void> {
		const payload = event.payload
		const productRepo = uow.getProductRepository()
		const deliveryRepo = uow.getDeliveryRepository()
		const delivery = await deliveryRepo.findById(payload.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}
		for (const item of delivery.getItems().values()) {
			const productId = item.getProductId()
			const product = await productRepo.findById(productId)
			if (product) {
				const newValue = item.getQuantity().value + product.stock.value
				product.stock = new ProductStock(newValue)
				await productRepo.update(product)
			}
		}
	}
}
