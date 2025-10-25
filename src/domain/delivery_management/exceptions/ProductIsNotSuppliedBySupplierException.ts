import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class ProductIsNotSuppliedBySupplierException extends ApplicationException {
	constructor() {
		super("Product is not supplied by supplier", 409)
	}
}
