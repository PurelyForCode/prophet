import { IUnitOfWork } from "../../../../core/interfaces/IUnitOfWork.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import {
	DeliveryStatus,
	DeliveryStatusValue,
} from "../../../../domain/delivery_management/entities/delivery/value_objects/DeliveryStatus.js"
import { DeliveryNotFoundException } from "../../../../domain/delivery_management/exceptions/DeliveryNotFoundException.js"
import { DeliveryManager } from "../../../../domain/delivery_management/services/DeliveryManager.js"

export type UpdateDeliveryInput = {
	deliveryId: EntityId
	fields: Partial<{
		status: DeliveryStatusValue
		requestedAt: Date
		scheduledArrivalDate: Date
		completedAt: Date
		cancelledAt: Date
	}>
}

export class UpdateDeliveryUsecase {
	constructor(private readonly uow: IUnitOfWork) {}
	async call(input: UpdateDeliveryInput) {
		const deliveryRepo = this.uow.getDeliveryRepository()
		const delivery = await deliveryRepo.findById(input.deliveryId)
		if (!delivery) {
			throw new DeliveryNotFoundException()
		}
		const dm = new DeliveryManager()
		dm.updateDelivery(delivery, {
			cancelledAt: input.fields.cancelledAt,
			completedAt: input.fields.completedAt,
			requestedAt: input.fields.requestedAt,
			scheduledArrivalDate: input.fields.scheduledArrivalDate,
			status: input.fields.status
				? new DeliveryStatus(input.fields.status)
				: undefined,
		})
		await this.uow.save(delivery)
	}
}
