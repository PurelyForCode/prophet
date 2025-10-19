import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class PermissionCanNotBeGrantedException extends ApplicationException {
	constructor() {
		super(
			"Only accounts with the staff role can have permissions granted",
			409,
		)
	}
}
