import { ApplicationException } from "../../../core/exceptions/ApplicationException.js"

export class PermissionCanNotBeRevokedException extends ApplicationException {
	constructor() {
		super(
			"Only accounts with the staff role can have permissions revoked",
			409,
		)
	}
}
