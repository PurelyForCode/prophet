import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class SupplierMismatchException extends ApplicationException {
	constructor() {
		console.log("supplier mismatch occurred")
		super("Internal Server Error", 500)
	}
}
