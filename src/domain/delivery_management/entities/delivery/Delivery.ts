import { ResourceIsArchivedException } from "../../../../core/exceptions/ResourceIsArchivedException.js"
import {
	AggregateRoot,
	EntityAction,
} from "../../../../core/interfaces/AggregateRoot.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DeliveryCompletedEvent } from "../../events/DeliveryCompletedEvent.js"
import { DeliveryIsNotCompletedAnymoreEvent } from "../../events/DeliveryIsNotCompletedAnymoreEvent.js"
import { DeliveryItemNotFoundException } from "../../exceptions/DeliveryItemNotFoundException.js"
import { DeliveryStatusIsNotAppropriateForCurrentAction } from "../../exceptions/DeliveryStatusIsNotAppropriateForCurrentAction.js"
import { DuplicateDeliveryItemProductInDeliveryException } from "../../exceptions/DuplicateDeliveryItemInDeliveryException.js"
import {
	DeliveryItem,
	UpdateDeliveryItemFields,
} from "../delivery_item/DeliveryItem.js"
import { DeliveryStatus } from "./value_objects/DeliveryStatus.js"

export class Delivery extends AggregateRoot {
	private supplierId: EntityId
	private accountId: EntityId
	private status: DeliveryStatus
	private completedAt: Date | null
	private deliveryRequestedAt: Date
	private scheduledArrivalDate: Date
	private cancelledAt: Date | null
	private createdAt: Date
	private updatedAt: Date
	private deletedAt: Date | null
	private items: Map<EntityId, DeliveryItem>

	private constructor(params: {
		id: EntityId
		supplierId: EntityId
		accountId: EntityId
		status: DeliveryStatus
		completedAt: Date | null
		deliveryRequestedAt: Date
		scheduledArrivalDate: Date
		cancelledAt: Date | null
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		items: Map<EntityId, DeliveryItem>
	}) {
		super(params.id)
		this.supplierId = params.supplierId
		this.accountId = params.accountId
		this.status = params.status
		this.completedAt = params.completedAt
		this.deliveryRequestedAt = params.deliveryRequestedAt
		this.scheduledArrivalDate = params.scheduledArrivalDate
		this.cancelledAt = params.cancelledAt
		this.createdAt = params.createdAt
		this.updatedAt = params.updatedAt
		this.deletedAt = params.deletedAt
		this.items = params.items
	}

	public static create(params: {
		id: EntityId
		supplierId: EntityId
		accountId: EntityId
		status: DeliveryStatus
		completedAt: Date | null
		deliveryRequestedAt: Date
		scheduledArrivalDate: Date
		cancelledAt: Date | null
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		items: Map<EntityId, DeliveryItem>
	}) {
		return new Delivery(params)
	}

	throwIfArchived() {
		if (this.getDeletedAt() !== null) {
			throw new ResourceIsArchivedException("Delivery")
		}
	}

	changeStatus(status: DeliveryStatus, date?: Date) {
		this.throwIfArchived()
		const originalStatus = this.status.value
		this.setStatus(status)

		switch (status.value) {
			case "completed":
				this.setCompletedAt(date ?? new Date())
				this.setCancelledAt(null)
				if (originalStatus !== "completed") {
					this.addDomainEvent(
						new DeliveryCompletedEvent({ deliveryId: this.id }),
					)
				}
				break

			case "cancelled":
				this.setCancelledAt(date ?? new Date())
				this.setCompletedAt(null)

				if (originalStatus === "completed") {
					this.addDomainEvent(
						new DeliveryIsNotCompletedAnymoreEvent({
							deliveryId: this.id,
						}),
					)
				}
				break

			case "pending":
				this.setCompletedAt(null)
				this.setCancelledAt(null)
				if (originalStatus === "completed") {
					this.addDomainEvent(
						new DeliveryIsNotCompletedAnymoreEvent({
							deliveryId: this.id,
						}),
					)
				}
				break

			default:
				throw new Error(`Unsupported status: ${status.value}`)
		}

		this.addTrackedEntity(this, EntityAction.updated)
	}

	addItem(item: DeliveryItem) {
		this.throwIfArchived()
		for (const deliveryItem of this.items.values()) {
			if (deliveryItem.getProductId() === item.getProductId()) {
				throw new DuplicateDeliveryItemProductInDeliveryException()
			}
		}
		this.items.set(item.id, item)
		this.addTrackedEntity(item, EntityAction.created)
	}

	removeItem(deliveryItemId: EntityId) {
		this.throwIfArchived()
		const item = this.items.get(deliveryItemId)
		if (!item) {
			throw new DeliveryItemNotFoundException()
		}
		this.items.delete(deliveryItemId)
		this.addTrackedEntity(item, EntityAction.deleted)
	}

	updateItem(itemId: EntityId, fields: UpdateDeliveryItemFields) {
		this.throwIfArchived()
		const existingItem = this.items.get(itemId)
		if (!existingItem) {
			throw new DeliveryItemNotFoundException()
		}
		if (fields.quantity) {
			existingItem.setQuantity(fields.quantity)
		}
		this.updatedAt = new Date()
		this.addTrackedEntity(this, EntityAction.updated)
		this.addTrackedEntity(existingItem, EntityAction.updated)
	}

	archive() {
		this.deletedAt = new Date()
		this.addTrackedEntity(this, EntityAction.updated)
	}

	unarchive() {
		this.deletedAt = null
		this.addTrackedEntity(this, EntityAction.updated)
	}

	getSupplierId(): EntityId {
		return this.supplierId
	}
	setSupplierId(value: EntityId) {
		this.supplierId = value
	}
	getAccountId(): EntityId {
		return this.accountId
	}
	setAccountId(value: EntityId) {
		this.accountId = value
	}
	getStatus(): DeliveryStatus {
		return this.status
	}
	setStatus(value: DeliveryStatus) {
		this.status = value
	}
	getCompletedAt(): Date | null {
		return this.completedAt
	}
	setCompletedAt(value: Date | null) {
		if (this.status.value !== "completed" && value !== null) {
			throw new DeliveryStatusIsNotAppropriateForCurrentAction()
		}
		this.completedAt = value
	}
	getRequestedAt(): Date {
		return this.deliveryRequestedAt
	}
	setRequestedAt(value: Date) {
		this.deliveryRequestedAt = value
	}
	getCancelledAt(): Date | null {
		return this.cancelledAt
	}
	setCancelledAt(value: Date | null) {
		if (this.status.value !== "cancelled" && value !== null) {
			throw new DeliveryStatusIsNotAppropriateForCurrentAction()
		}
		this.cancelledAt = value
	}
	getCreatedAt(): Date {
		return this.createdAt
	}
	setCreatedAt(value: Date) {
		this.createdAt = value
	}
	getUpdatedAt(): Date {
		return this.updatedAt
	}
	setUpdatedAt(value: Date) {
		this.updatedAt = value
	}
	getDeletedAt(): Date | null {
		return this.deletedAt
	}
	setDeletedAt(value: Date | null) {
		this.deletedAt = value
	}
	getScheduledArrivalDate(): Date {
		return this.scheduledArrivalDate
	}
	setScheduledArrivalDate(value: Date) {
		this.scheduledArrivalDate = value
	}
	getItems() {
		return this.items
	}
}
