import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProductDoesNotHaveEnoughSalesException extends ApplicationException {
	constructor() {
		super(
			"Product needs to have at least 30 days of sales to start forecasting",
			409,
		)
	}
}
