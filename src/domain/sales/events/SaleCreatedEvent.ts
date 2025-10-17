import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { SALE_EVENTS } from "./SaleEventList.js"

export class FirstSaleCreatedForDate extends DomainEvent<{
	productId: EntityId
	saleId: EntityId
}> {
	constructor(productId: EntityId, saleId: EntityId) {
		super(SALE_EVENTS.FIRST_SALE_CREATED_FOR_DATE, { productId, saleId })
	}
}
