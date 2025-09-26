import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class ProductGroupIsNotInACategoryException extends ApplicationException {
	constructor() {
		super("Product group is not in a category", 409)
	}
}

