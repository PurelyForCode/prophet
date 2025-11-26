import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { DeliveryEvents } from "./DeliveryManagementDomainEventList.js"

type Payload = {
	deliveryId: EntityId
}

export class DeliveryCompletedEvent extends DomainEvent<Payload> {
	constructor(payload: Payload) {
		super(DeliveryEvents.DELIVERY_COMPLETED, payload)
	}
}
