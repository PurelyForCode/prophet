import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DeliveryStatus } from "../../../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js"
import { DeliveryItem } from "../../../../domain/delivery_management/entities/delivery_item/DeliveryItem.js"
import { DeliveryItemQuantity } from "../../../../domain/delivery_management/entities/delivery_item/value_objects/DeliveryItemQuantity.js"
import { DeliveryCompletedEvent } from "../../../../domain/delivery_management/events/DeliveryCompletedEvent.js"
import { ProductIsNotSuppliedBySupplierException } from "../../../../domain/delivery_management/exceptions/ProductIsNotSuppliedBySupplierException.js"
import { SupplierNotFoundException } from "../../../../domain/delivery_management/exceptions/SupplierNotFoundException.js"
import { DeliveryManager } from "../../../../domain/delivery_management/services/DeliveryManager.js"
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js"

export type CreateDeliveryInput = {
	accountId: EntityId
	supplierId: EntityId
	status: string
	items:
		| {
				quantity: number
				productId: EntityId
		  }[]
		| undefined
}

export class CreateDeliveryUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
		private readonly eventBus: IEventBus,
	) {}
	async call(input: CreateDeliveryInput) {
		const supplierRepo = this.uow.getSupplierRepository()
		const supplier = await supplierRepo.findById(input.supplierId)
		if (!supplier) {
			throw new SupplierNotFoundException()
		}
		const id = this.idGenerator.generate()
		const status = new DeliveryStatus(input.status)
		const deliveryManager = new DeliveryManager()
		const delivery = deliveryManager.createDelivery(supplier, {
			accountId: input.accountId,
			id: id,
			status: status,
		})
		const productRepo = this.uow.getProductRepository()
		const suppliedProductRepo = this.uow.getSuppliedProductRepository()
		if (input.items) {
			for (const item of input.items) {
				const id = this.idGenerator.generate()
				if (!(await productRepo.findById(item.productId))) {
					throw new ProductNotFoundException()
				}

				const isSupplied = await suppliedProductRepo.isProductSupplied(
					item.productId,
					supplier.id,
				)
				if (!isSupplied) {
					throw new ProductIsNotSuppliedBySupplierException()
				}
				const quantity = new DeliveryItemQuantity(item.quantity)
				const deliveryItem = DeliveryItem.create({
					id: id,
					productId: item.productId,
					deliveryId: delivery.id,
					quantity: quantity,
				})
				delivery.addItem(deliveryItem)
			}
		}
		if (status.value === "completed") {
			delivery.addDomainEvent(
				new DeliveryCompletedEvent({ deliveryId: delivery.id }),
			)
		}

		await this.uow.save(delivery)
		await this.eventBus.dispatchAggregateEvents(delivery, this.uow)
	}
}
