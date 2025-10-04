import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class DuplicateProductGroupNameException extends ApplicationException {
	constructor() {
		super("Product group name is already taken", 409)
	}
}
