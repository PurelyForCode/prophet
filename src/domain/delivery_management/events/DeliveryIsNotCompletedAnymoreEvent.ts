import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { DeliveryEvents } from "./DeliveryManagementDomainEventList.js"

type Payload = {
	deliveryId: EntityId
}

export class DeliveryIsNotCompletedAnymoreEvent extends DomainEvent<Payload> {
	constructor(payload: Payload) {
		super(DeliveryEvents.DELIVERY_IS_NOT_COMPLETED_ANYMORE, payload)
	}
}
