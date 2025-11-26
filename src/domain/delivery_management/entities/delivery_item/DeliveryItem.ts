import { Entity } from "../../../../core/interfaces/Entity.js"
import { EntityId } from "../../../../core/types/EntityId.js"
import { DeliveryItemQuantity } from "./value_objects/DeliveryItemQuantity.js"

export type UpdateDeliveryItemFields = Partial<{
	quantity: DeliveryItemQuantity
}>

export class DeliveryItem extends Entity {
	private constructor(
		id: EntityId,
		private productId: EntityId,
		private deliveryId: EntityId,
		private quantity: DeliveryItemQuantity,
	) {
		super(id)
	}

	public static create(params: {
		id: EntityId
		productId: EntityId
		deliveryId: EntityId
		quantity: DeliveryItemQuantity
	}) {
		return new DeliveryItem(
			params.id,
			params.productId,
			params.deliveryId,
			params.quantity,
		)
	}

	public getQuantity(): DeliveryItemQuantity {
		return this.quantity
	}
	public setQuantity(value: DeliveryItemQuantity) {
		this.quantity = value
	}
	public getDeliveryId(): EntityId {
		return this.deliveryId
	}
	public setDeliveryId(value: EntityId) {
		this.deliveryId = value
	}
	public getProductId(): EntityId {
		return this.productId
	}
	public setProductId(value: EntityId) {
		this.productId = value
	}
}
