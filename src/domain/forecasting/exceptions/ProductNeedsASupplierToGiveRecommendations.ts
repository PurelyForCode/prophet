import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProductNeedsASupplierToGiveRecommendations extends ApplicationException {
	constructor() {
		super(
			"Product needs to have a set supplier to give inventory recommendations",
			409,
		)
	}
}
