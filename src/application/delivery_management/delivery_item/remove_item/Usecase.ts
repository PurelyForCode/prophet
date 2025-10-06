import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js"

export type RemoveItemOnDeliveryInput = {
	deliveryId: EntityId
	itemId: EntityId
}

export class RemoveItemOnDeliveryUsecase {
	constructor(private readonly uow: IUnitOfWork) {}

	async call(input: RemoveItemOnDeliveryInput) {
		const deliveryRepo = this.uow.getDeliveryRepository()
		const delivery = await deliveryRepo.findById(input.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}
		delivery.removeItem(input.itemId)
		await this.uow.save(delivery)
	}
}
