import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DeliveryStatusIsNotAppropriateForCurrentAction extends ApplicationException {
	constructor() {
		super("Delivery status is not appropriate for current action", 409)
	}
}
