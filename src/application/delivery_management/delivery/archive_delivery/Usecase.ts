import { IEventBus } from "../../../../core/interfaces/IDomainEventBus.js"
import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js"

export type ArchiveDeliveryInput = {
	deliveryId: EntityId
}

export class ArchiveDeliveryUsecase {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: ArchiveDeliveryInput) {
		const deliveryRepo = this.uow.getDeliveryRepository()
		const delivery = await deliveryRepo.findById(input.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}
		delivery.archive()
		await this.uow.save(delivery)
	}
}
