import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProductGroupNotFoundException extends ApplicationException {
	constructor() {
		super("Product group not found", 404)
	}
}
