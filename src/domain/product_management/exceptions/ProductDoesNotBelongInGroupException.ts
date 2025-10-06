import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProductDoesNotBelongInGroupException extends ApplicationException {
	constructor() {
		super("Product does not belong in the group", 409)
	}
}
