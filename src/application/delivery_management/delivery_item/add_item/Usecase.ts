import { IIdGenerator } from "../../../../core/interfaces/IIdGenerator.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DeliveryItem } from "../../../../domain/delivery_management/entities/delivery_item/DeliveryItem.js"
import { DeliveryItemQuantity } from "../../../../domain/delivery_management/entities/delivery_item/value_objects/DeliveryItemQuantity.js"
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js"
import { ProductIsNotSuppliedBySupplierException } from "../../../../domain/delivery_management/exceptions/ProductIsNotSuppliedBySupplierException.js"
import { ProductNotFoundException } from "../../../../domain/product_management/exceptions/ProductNotFoundException.js"

export type AddItemToDeliveryInput = {
	deliveryId: EntityId
	items: {
		quantity: number
		productId: EntityId
	}[]
}

export class AddItemToDeliveryUsecase {
	constructor(
		private readonly uow: IUnitOfWork,
		private readonly idGenerator: IIdGenerator,
	) {}

	async call(input: AddItemToDeliveryInput) {
		const deliveryRepo = this.uow.getDeliveryRepository()
		const delivery = await deliveryRepo.findById(input.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}

		const productRepo = this.uow.getProductRepository()
		const suppliedProductRepo = this.uow.getSuppliedProductRepository()

		for (const item of input.items) {
			if (!(await productRepo.findById(item.productId))) {
				throw new ProductNotFoundException()
			}
			const isSupplied = await suppliedProductRepo.isProductSupplied(
				item.productId,
				delivery.getSupplierId(),
			)
			if (!isSupplied) {
				throw new ProductIsNotSuppliedBySupplierException()
			}
			const id = this.idGenerator.generate()
			const quantity = new DeliveryItemQuantity(item.quantity)
			const deliveryItem = DeliveryItem.create({
				id: id,
				productId: item.productId,
				deliveryId: input.deliveryId,
				quantity: quantity,
			})
			delivery.addItem(deliveryItem)
		}
		await this.uow.save(delivery)
	}
}
