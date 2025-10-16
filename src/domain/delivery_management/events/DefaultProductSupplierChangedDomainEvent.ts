import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { DeliveryManagementDomainEventList } from "./DeliveryManagementDomainEventList.js"

type Payload = {
	productId: EntityId
	newDefaultSupplierId: EntityId
}

export class DefaultProductSupplierChangedDomainEvent extends DomainEvent<Payload> {
	constructor(payload: Payload) {
		super(
			DeliveryManagementDomainEventList.DEFAULT_PRODUCT_SUPPLIER_CHANGED,
			payload,
		)
	}
}
