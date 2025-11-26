import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DuplicateDeliveryItemProductInDeliveryException extends ApplicationException {
	constructor() {
		super("Product is already added in the delivery", 409)
	}
}
