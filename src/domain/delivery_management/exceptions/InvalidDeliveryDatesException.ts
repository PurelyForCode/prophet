import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class InvalidDeliveryDatesException extends ApplicationException {
	constructor() {
		super(
			"Delivery requestedAt must be lower than scheduledArrivalDate",
			409,
		)
	}
}
