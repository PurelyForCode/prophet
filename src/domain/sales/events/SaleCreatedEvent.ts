import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { SALE_EVENTS } from "./SaleEventList.js"

export class SaleCreatedEvent extends DomainEvent<{
	productId: EntityId
	saleId: EntityId
}> {
	constructor(productId: EntityId, saleId: EntityId) {
		super(SALE_EVENTS.SALE_CREATED, { productId, saleId })
	}
}
