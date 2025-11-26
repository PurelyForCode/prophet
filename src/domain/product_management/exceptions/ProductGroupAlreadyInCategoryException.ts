import { ApplicationException } from "../../../core/exceptions/ApplicationException.js";

export class ProductGroupAlreadyInCategoryException extends ApplicationException {
	constructor() {
		super("Product group is already in the category", 409)
	}
}
