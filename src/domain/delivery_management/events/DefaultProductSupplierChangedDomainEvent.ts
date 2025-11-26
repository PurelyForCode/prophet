import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { DeliveryEvents } from "./DeliveryManagementDomainEventList.js"

type Payload = {
	productId: EntityId
	oldDefaultSupplierId: EntityId
}

export class DefaultProductSupplierChangedDomainEvent extends DomainEvent<Payload> {
	constructor(payload: Payload) {
		super(DeliveryEvents.DEFAULT_PRODUCT_SUPPLIER_CHANGED, payload)
	}
}
