import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProductIsAlreadySuppliedException extends ApplicationException {
	constructor() {
		super("Product is already supplied", 409)
	}
}
