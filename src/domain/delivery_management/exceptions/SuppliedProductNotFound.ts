import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class SuppliedProductNotFound extends ApplicationException {
	constructor() {
		super("Supplied product not found", 404)
	}
}
