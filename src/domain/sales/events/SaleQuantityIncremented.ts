import { DomainEvent } from "../../../core/interfaces/DomainEvent.js"
import { EntityId } from "../../../core/types/EntityId.js"
import { SALE_EVENTS } from "./SaleEventList.js"

export class SaleQuantityIncremented extends DomainEvent<{
	productId: EntityId
	amount: number
}> {
	constructor(productId: EntityId, amount: number) {
		super(SALE_EVENTS.QUANTITY_INCREMENTED, { productId, amount })
	}
}
