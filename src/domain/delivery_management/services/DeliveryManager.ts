import { EntityAction } from "../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { Delivery } from "../entities/delivery/Delivery.js"
import { DeliveryStatus } from "../entities/delivery/value_objects/DeliveryStatus.js"
import { Supplier } from "../entities/supplier/Supplier.js"
import { InvalidDeliveryDatesException } from "../exceptions/InvalidDeliveryDatesException.js"

export class DeliveryManager {
	createDelivery(
		supplier: Supplier,
		params: {
			id: EntityId
			accountId: EntityId
			status: DeliveryStatus
		},
	) {
		const now = new Date()
		const scheduledArrivalDate = new Date()
		scheduledArrivalDate.setDate(scheduledArrivalDate.getDate() + 7)
		const delivery = Delivery.create({
			id: params.id,
			supplierId: supplier.id,
			accountId: params.accountId,
			status: params.status,
			cancelledAt: null,
			scheduledArrivalDate: scheduledArrivalDate,
			deliveryRequestedAt: now,
			completedAt: null,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
			items: new Map(),
		})
		delivery.addTrackedEntity(delivery, EntityAction.created)
		return delivery
	}

	archiveDelivery(delivery: Delivery) {
		delivery.archive()
		delivery.addTrackedEntity(delivery, EntityAction.updated)
		return delivery
	}

	unarchiveDelivery(delivery: Delivery) {
		delivery.unarchive()
		delivery.addTrackedEntity(delivery, EntityAction.updated)
		return delivery
	}

	updateDelivery(
		delivery: Delivery,
		fields: Partial<{
			status: DeliveryStatus
			requestedAt: Date
			scheduledArrivalDate: Date
			completedAt: Date | null
			cancelledAt: Date | null
		}>,
	) {
		delivery.throwIfArchived()
		const requestedAt = fields.requestedAt ?? delivery.getRequestedAt()
		const scheduledArrivalDate =
			fields.scheduledArrivalDate ?? delivery.getScheduledArrivalDate()

		if (requestedAt && scheduledArrivalDate) {
			if (scheduledArrivalDate < requestedAt) {
				throw new InvalidDeliveryDatesException()
			}
		}
		fields.requestedAt && delivery.setRequestedAt(fields.requestedAt)
		fields.scheduledArrivalDate &&
			delivery.setScheduledArrivalDate(fields.scheduledArrivalDate)
		fields.status && delivery.changeStatus(fields.status)
		fields.completedAt && delivery.setCompletedAt(fields.completedAt)
		fields.cancelledAt && delivery.setCancelledAt(fields.cancelledAt)
		delivery.addTrackedEntity(delivery, EntityAction.updated)

		return delivery
	}
}
